'use client';

import React, { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar } from 'lucide-react'

interface Project {
  id: string
  name: string
}

interface TeamMember {
  id: string
  name: string
  email: string
  role: string
  department: string
  created_at: string
}

interface Task {
  id: string
  title: string
  description: string
  project_id: string
  project_name?: string
  assignee_id: string
  assignee_name?: string
  status: string
  due_date: string
  created_at: string
}

const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  
  // 新建任务表单数据
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    project_id: '',
    assignee_id: '',
    due_date: new Date().toISOString().split('T')[0]
  })

  // 获取项目列表
  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name')
      
      if (error) {
        console.error('Error fetching projects:', error)
      } else {
        setProjects(data || [])
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
    }
  }

  // 获取团队成员列表
  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
      
      if (error) {
        console.error('Error fetching members:', error)
      } else {
        setMembers(data || [])
      }
    } catch (error) {
      console.error('Error fetching members:', error)
    }
  }

  // 获取任务列表
  const fetchTasks = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
      
      if (error) {
        console.error('Error fetching tasks:', error)
      } else {
        // 为每个任务添加项目名称和负责人名称
        const tasksWithDetails = data.map((task) => {
          const project = projects.find(p => p.id === task.project_id)
          const assignee = members.find(m => m.id === task.assignee_id)
          return {
            ...task,
            project_name: project?.name || '未知项目',
            assignee_name: assignee?.name || '未指派'
          }
        })
        setTasks(tasksWithDetails)
      }
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  // 新建任务
  const handleCreateTask = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        alert('请先登录后再创建任务')
        return
      }
      
      const { error } = await supabase
        .from('tasks')
        .insert({
          ...newTask,
          status: 'todo'
        })
      
      if (error) {
        console.error('Error creating task:', error)
        alert('创建任务失败，请稍后重试')
      } else {
        setIsCreateDialogOpen(false)
        // 重置表单
        setNewTask({
          title: '',
          description: '',
          project_id: '',
          assignee_id: '',
          due_date: new Date().toISOString().split('T')[0]
        })
        // 重新获取任务列表
        fetchTasks()
      }
    } catch (error) {
      console.error('Error creating task:', error)
      alert('创建任务失败，请稍后重试')
    }
  }

  // 更新任务状态
  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId)
      
      if (error) {
        console.error('Error updating task status:', error)
        alert('更新任务状态失败，请稍后重试')
      } else {
        // 重新获取任务列表
        fetchTasks()
      }
    } catch (error) {
      console.error('Error updating task status:', error)
      alert('更新任务状态失败，请稍后重试')
    }
  }

  useEffect(() => {
    fetchProjects()
    fetchMembers()
  }, [])

  useEffect(() => {
    if (projects.length > 0 && members.length > 0) {
      fetchTasks()
    }
  }, [projects, members])

  // 按状态分组任务
  const todoTasks = tasks.filter(task => task.status === 'todo')
  const inProgressTasks = tasks.filter(task => task.status === 'in_progress')
  const doneTasks = tasks.filter(task => task.status === 'done')

  return (
    <Layout>
      <div className="space-y-6 pt-16 pl-64">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">任务管理</h1>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-blue-600">
                新建任务
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>新建任务</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="title" className="block text-sm font-medium">
                    任务名称 *
                  </label>
                  <Input
                    id="title"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    placeholder="请输入任务名称"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="description" className="block text-sm font-medium">
                    任务描述
                  </label>
                  <Textarea
                    id="description"
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    placeholder="请输入任务描述"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="project_id" className="block text-sm font-medium">
                    关联项目 *
                  </label>
                  <Select value={newTask.project_id} onValueChange={(value) => setNewTask({ ...newTask, project_id: value })}>
                    <SelectTrigger id="project_id" className="w-full">
                      <SelectValue placeholder="请选择项目" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="assignee_id" className="block text-sm font-medium">
                    负责人 *
                  </label>
                  <Select value={newTask.assignee_id} onValueChange={(value) => setNewTask({ ...newTask, assignee_id: value })}>
                    <SelectTrigger id="assignee_id" className="w-full">
                      <SelectValue placeholder="请选择负责人" />
                    </SelectTrigger>
                    <SelectContent position="popper" sideOffset={4} align="start" className="bg-gray-800 text-white shadow-md z-50" style={{ width: '100%' }}>
                      {members.map((member) => (
                        <SelectItem key={member.id} value={member.id} className="text-white hover:bg-gray-700 focus:bg-gray-700">
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="due_date" className="block text-sm font-medium">
                    截止日期 *
                  </label>
                  <input
                    id="due_date"
                    type="date"
                    value={newTask.due_date}
                    onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-4">
                <Button
                  variant="secondary"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  取消
                </Button>
                <Button
                  onClick={handleCreateTask}
                  disabled={!newTask.title || !newTask.project_id || !newTask.assignee_id}
                >
                  确认创建
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 待办列 */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h2 className="text-lg font-medium mb-4">待办 (Todo)</h2>
              <div className="space-y-4">
                {todoTasks.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    暂无待办任务
                  </div>
                ) : (
                  todoTasks.map((task) => (
                    <Card key={task.id}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">{task.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <p className="text-xs text-gray-500 mb-2">项目：{task.project_name}</p>
                        <p className="text-xs text-gray-500 mb-2">截止日期：{task.due_date}</p>
                        <div className="flex items-center mb-3">
                          {task.status === 'in_progress' && (
                            <span className="w-2 h-2 rounded-full bg-blue-500 mr-1"></span>
                          )}
                          <p className={`text-xs ${task.status === 'done' ? 'text-gray-400' : 'text-gray-500'}`}>
                            负责人：{task.assignee_name || '未指派'}
                          </p>
                        </div>
                        <Select value={task.status} onValueChange={(value) => updateTaskStatus(task.id, value)}>
                          <SelectTrigger className="w-full mt-3 border-gray-200 rounded-md">
                            <SelectValue placeholder="选择状态" />
                          </SelectTrigger>
                          <SelectContent position="popper" sideOffset={4} align="start" className="bg-gray-800 text-white shadow-md z-50" style={{ width: '100%' }}>
                            <SelectItem value="todo" className="text-white hover:bg-gray-700 focus:bg-gray-700">待办</SelectItem>
                            <SelectItem value="in_progress" className="text-white hover:bg-gray-700 focus:bg-gray-700">进行中</SelectItem>
                            <SelectItem value="done" className="text-white hover:bg-gray-700 focus:bg-gray-700">已完成</SelectItem>
                          </SelectContent>
                        </Select>
                      </CardContent>
                      <CardFooter className="pt-0">
                      </CardFooter>
                    </Card>
                  ))
                )}
              </div>
            </div>

            {/* 进行中列 */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h2 className="text-lg font-medium mb-4">进行中 (In Progress)</h2>
              <div className="space-y-4">
                {inProgressTasks.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    暂无进行中任务
                  </div>
                ) : (
                  inProgressTasks.map((task) => (
                    <Card key={task.id}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">{task.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <p className="text-xs text-gray-500 mb-2">项目：{task.project_name}</p>
                        <p className="text-xs text-gray-500 mb-2">截止日期：{task.due_date}</p>
                        <div className="flex items-center mb-3">
                          {task.status === 'in_progress' && (
                            <span className="w-2 h-2 rounded-full bg-blue-500 mr-1"></span>
                          )}
                          <p className={`text-xs ${task.status === 'done' ? 'text-gray-400' : 'text-gray-500'}`}>
                            负责人：{task.assignee_name || '未指派'}
                          </p>
                        </div>
                        <Select value={task.status} onValueChange={(value) => updateTaskStatus(task.id, value)}>
                          <SelectTrigger className="w-full mt-3 border-gray-200 rounded-md">
                            <SelectValue placeholder="选择状态" />
                          </SelectTrigger>
                          <SelectContent position="popper" sideOffset={4} align="start" className="bg-gray-800 text-white shadow-md z-50" style={{ width: '100%' }}>
                            <SelectItem value="todo" className="text-white hover:bg-gray-700 focus:bg-gray-700">待办</SelectItem>
                            <SelectItem value="in_progress" className="text-white hover:bg-gray-700 focus:bg-gray-700">进行中</SelectItem>
                            <SelectItem value="done" className="text-white hover:bg-gray-700 focus:bg-gray-700">已完成</SelectItem>
                          </SelectContent>
                        </Select>
                      </CardContent>
                      <CardFooter className="pt-0">
                      </CardFooter>
                    </Card>
                  ))
                )}
              </div>
            </div>

            {/* 已完成列 */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h2 className="text-lg font-medium mb-4">已完成 (Done)</h2>
              <div className="space-y-4">
                {doneTasks.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    暂无已完成任务
                  </div>
                ) : (
                  doneTasks.map((task) => (
                    <Card key={task.id}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">{task.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <p className="text-xs text-gray-500 mb-2">项目：{task.project_name}</p>
                        <p className="text-xs text-gray-500 mb-2">截止日期：{task.due_date}</p>
                        <div className="flex items-center mb-3">
                          {task.status === 'in_progress' && (
                            <span className="w-2 h-2 rounded-full bg-blue-500 mr-1"></span>
                          )}
                          <p className={`text-xs ${task.status === 'done' ? 'text-gray-400' : 'text-gray-500'}`}>
                            负责人：{task.assignee_name || '未指派'}
                          </p>
                        </div>
                        <Select value={task.status} onValueChange={(value) => updateTaskStatus(task.id, value)}>
                          <SelectTrigger className="w-full mt-3 border-gray-200 rounded-md">
                            <SelectValue placeholder="选择状态" />
                          </SelectTrigger>
                          <SelectContent position="popper" sideOffset={4} align="start" className="bg-gray-800 text-white shadow-md z-50" style={{ width: '100%' }}>
                            <SelectItem value="todo" className="text-white hover:bg-gray-700 focus:bg-gray-700">待办</SelectItem>
                            <SelectItem value="in_progress" className="text-white hover:bg-gray-700 focus:bg-gray-700">进行中</SelectItem>
                            <SelectItem value="done" className="text-white hover:bg-gray-700 focus:bg-gray-700">已完成</SelectItem>
                          </SelectContent>
                        </Select>
                      </CardContent>
                      <CardFooter className="pt-0">
                      </CardFooter>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default TasksPage