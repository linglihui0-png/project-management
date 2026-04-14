'use client';

import React, { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface Project {
  id: string
  name: string
  status: string
}

interface Task {
  id: string
  title: string
  status: string
  due_date: string
  assignee_id: string
  assignee_name?: string
}

interface TeamMember {
  id: string
  name: string
}

const HomePage = () => {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)

  // 统计数据
  const [stats, setStats] = useState({
    totalProjects: 0,
    inProgressTasks: 0,
    overdueTasks: 0,
    teamSize: 0
  })

  // 团队负载
  const [teamWorkload, setTeamWorkload] = useState<Array<{ name: string, tasks: number }>>([])

  // 紧急任务
  const [urgentTasks, setUrgentTasks] = useState<Task[]>([])

  // 图表数据
  const [taskStatusData, setTaskStatusData] = useState<Array<{ name: string, value: number }>>([])
  const [teamPerformanceData, setTeamPerformanceData] = useState<Array<{ name: string, inProgress: number, done: number }>>([])

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
      } else {
        // 获取数据
        fetchData()
      }
    }
    checkAuth()
  }, [router])

  const fetchData = async () => {
    setLoading(true)
    try {
      // 并行获取数据
      const [projectsData, tasksData, membersData] = await Promise.all([
        supabase.from('projects').select('*'),
        supabase.from('tasks').select('*'),
        supabase.from('team_members').select('*')
      ])

      if (projectsData.error) {
        console.error('Error fetching projects:', projectsData.error)
      } else {
        setProjects(projectsData.data || [])
      }

      if (tasksData.error) {
        console.error('Error fetching tasks:', tasksData.error)
      } else {
        // 为任务添加负责人名称
        const tasksWithAssigneeNames = (tasksData.data || []).map((task) => {
          const member = (membersData.data || []).find(m => m.id === task.assignee_id)
          return {
            ...task,
            assignee_name: member?.name || '未指派'
          }
        })
        setTasks(tasksWithAssigneeNames)
      }

      if (membersData.error) {
        console.error('Error fetching members:', membersData.error)
      } else {
        setMembers(membersData.data || [])
      }

      // 计算统计数据
      calculateStats(projectsData.data || [], tasksData.data || [], membersData.data || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (projects: any[], tasks: any[], members: any[]) => {
    const totalProjects = projects.length
    const inProgressTasks = tasks.filter(task => task.status === 'in_progress').length

    // 计算逾期任务
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const overdueTasks = tasks.filter(task => {
      const dueDate = new Date(task.due_date)
      return dueDate < today && task.status !== 'done'
    }).length

    const teamSize = members.length

    setStats({
      totalProjects,
      inProgressTasks,
      overdueTasks,
      teamSize
    })

    // 计算团队负载
    const workloadMap = new Map<string, number>()
    members.forEach(member => {
      workloadMap.set(member.id, 0)
    })

    tasks.forEach(task => {
      if (task.status === 'in_progress' && task.assignee_id) {
        workloadMap.set(task.assignee_id, (workloadMap.get(task.assignee_id) || 0) + 1)
      }
    })

    const workloadArray = Array.from(workloadMap.entries()).map(([id, count]) => {
      const member = members.find(m => m.id === id)
      return {
        name: member?.name || '未指派',
        tasks: count
      }
    }).sort((a, b) => b.tasks - a.tasks)

    setTeamWorkload(workloadArray)

    // 计算任务状态分布（饼图数据）
    const todoTasks = tasks.filter(task => task.status === 'todo').length
    const inProgress = tasks.filter(task => task.status === 'in_progress').length
    const doneTasks = tasks.filter(task => task.status === 'done').length

    setTaskStatusData([
      { name: '待办', value: todoTasks },
      { name: '进行中', value: inProgress },
      { name: '已完成', value: doneTasks }
    ])

    // 计算团队性能数据（柱状图数据）
    const performanceMap = new Map<string, { inProgress: number, done: number }>()
    members.forEach(member => {
      performanceMap.set(member.id, { inProgress: 0, done: 0 })
    })

    tasks.forEach(task => {
      if (task.assignee_id) {
        const current = performanceMap.get(task.assignee_id) || { inProgress: 0, done: 0 }
        if (task.status === 'in_progress') {
          performanceMap.set(task.assignee_id, { ...current, inProgress: current.inProgress + 1 })
        } else if (task.status === 'done') {
          performanceMap.set(task.assignee_id, { ...current, done: current.done + 1 })
        }
      }
    })

    const performanceArray = Array.from(performanceMap.entries()).map(([id, data]) => {
      const member = members.find(m => m.id === id)
      return {
        name: member?.name || '未指派',
        inProgress: data.inProgress,
        done: data.done
      }
    }).filter(item => item.inProgress > 0 || item.done > 0).sort((a, b) => (b.inProgress + b.done) - (a.inProgress + a.done))

    setTeamPerformanceData(performanceArray)

    // 计算紧急任务（最近7天内到期的任务）
    const sevenDaysLater = new Date()
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7)
    sevenDaysLater.setHours(23, 59, 59, 999)

    const urgent = tasks
      .filter(task => {
        const dueDate = new Date(task.due_date)
        return dueDate <= sevenDaysLater && task.status !== 'done'
      })
      .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
      .slice(0, 5)

    // 为紧急任务添加负责人名称
    const urgentWithNames = urgent.map(task => {
      const member = members.find(m => m.id === task.assignee_id)
      return {
        ...task,
        assignee_name: member?.name || '未指派'
      }
    })

    setUrgentTasks(urgentWithNames)
  }

  return (
    <div>
      <div className="space-y-6 pt-16 pl-64">
        <h1 className="text-2xl font-bold">工作台</h1>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {/* 统计卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-sm font-medium text-gray-500">项目总数</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{stats.totalProjects}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-sm font-medium text-gray-500">进行中任务</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{stats.inProgressTasks}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-sm font-medium text-gray-500">逾期警告</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-red-600">{stats.overdueTasks}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-sm font-medium text-gray-500">团队规模</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{stats.teamSize}</p>
                </CardContent>
              </Card>
            </div>

            {/* 图表区域 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 任务状态饼图 */}
              <Card>
                <CardHeader>
                  <CardTitle>任务进度</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    {taskStatusData.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        暂无任务数据
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={taskStatusData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => \${name} ${((percent || 0) * 100).toFixed(0)}%`}`
                          >
                            {taskStatusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={index === 0 ? '#9CA3AF' : index === 1 ? '#3B82F6' : '#10B981'} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* 团队战力柱状图 */}
              <Card>
                <CardHeader>
                  <CardTitle>团队战力榜</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    {teamPerformanceData.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        暂无团队数据
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={teamPerformanceData}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="inProgress" name="进行中" fill="#3B82F6" />
                          <Bar dataKey="done" name="已完成" fill="#10B981" />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 紧急任务提醒 */}
            <Card>
              <CardHeader>
                <CardTitle>紧急任务提醒</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {urgentTasks.length === 0 ? (
                    <p className="text-gray-500">暂无紧急任务</p>
                  ) : (
                    urgentTasks.map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div>
                          <h3 className="font-medium">{task.title}</h3>
                          <p className="text-sm text-gray-500">
                            负责人：{task.assignee_name} | 截止日期：{task.due_date}
                          </p>
                        </div>
                        <span className="text-sm font-medium text-red-500">
                          {(() => {
                            const dueDate = new Date(task.due_date)
                            const today = new Date()
                            today.setHours(0, 0, 0, 0)
                            const diffTime = dueDate.getTime() - today.getTime()
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                            return diffDays <= 0 ? '已逾期' : `${diffDays}天`
                          })()}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </>
    </>
  )
}

export default HomePage
