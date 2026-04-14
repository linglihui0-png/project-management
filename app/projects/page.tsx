'use client';

import React, { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from 'lucide-react'
import Link from 'next/link'

interface Project {
  id: string
  name: string
  description: string
  start_date: string
  end_date: string
  status: string
  created_by: string
  created_at: string
}

const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  
  // 新建项目表单数据
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0]
  })

  // 获取项目列表
  const fetchProjects = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
      
      if (error) {
        console.error('Error fetching projects:', error)
      } else {
        console.log('Projects data before deduplication:', data)
        console.log('Number of projects before deduplication:', data ? data.length : 0)
        // 去重处理，基于项目 ID
        const uniqueProjects = data ? Array.from(new Map(data.map((project) => [project.id, project])).values()) : []
        console.log('Projects data after deduplication:', uniqueProjects)
        console.log('Number of projects after deduplication:', uniqueProjects.length)
        setProjects(uniqueProjects)
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  // 新建项目
  const handleCreateProject = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        alert('请先登录后再创建项目')
        return
      }
      
      const { error } = await supabase
        .from('projects')
        .insert({
          ...newProject,
          status: 'active',
          created_by: user.id
        })
      
      if (error) {
        console.error('Error creating project:', error)
        alert('创建项目失败，请稍后重试')
      } else {
        setIsCreateDialogOpen(false)
        // 重置表单
        setNewProject({
          name: '',
          description: '',
          start_date: new Date().toISOString().split('T')[0],
          end_date: new Date().toISOString().split('T')[0]
        })
        // 重新获取项目列表
        fetchProjects()
      }
    } catch (error) {
      console.error('Error creating project:', error)
      alert('创建项目失败，请稍后重试')
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  return (
    <Layout>
      <div className="space-y-6 pt-16 pl-64">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">项目管理</h1>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-blue-600">
                新建项目
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>新建项目</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-medium">
                    项目名称
                  </label>
                  <Input
                    id="name"
                    value={newProject.name}
                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                    placeholder="请输入项目名称"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="description" className="block text-sm font-medium">
                    项目描述
                  </label>
                  <Textarea
                    id="description"
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    placeholder="请输入项目描述"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="start_date" className="block text-sm font-medium">
                      开始日期
                    </label>
                    <div className="relative">
                      <Input
                        id="start_date"
                        type="date"
                        value={newProject.start_date}
                        onChange={(e) => setNewProject({ ...newProject, start_date: e.target.value })}
                      />
                      <Calendar className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="end_date" className="block text-sm font-medium">
                      截止日期
                    </label>
                    <div className="relative">
                      <Input
                        id="end_date"
                        type="date"
                        value={newProject.end_date}
                        onChange={(e) => setNewProject({ ...newProject, end_date: e.target.value })}
                      />
                      <Calendar className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="secondary"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  取消
                </Button>
                <Button
                  onClick={handleCreateProject}
                  disabled={!newProject.name}
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
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-gray-400 mb-4">
              <Calendar size={48} />
            </div>
            <h3 className="text-lg font-medium mb-2">暂无项目</h3>
            <p className="text-gray-500 mb-4">点击上方"新建项目"按钮创建您的第一个项目</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div key={project.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-4 flex flex-col">
                <h3 className="text-lg font-medium mb-2">{project.name}</h3>
                <p className="text-gray-600 mb-4 flex-grow">{project.description}</p>
                <div className="flex justify-between text-sm text-gray-500 mb-4">
                  <div>
                    <span className="font-medium">开始日期：</span>
                    {project.start_date}
                  </div>
                  <div>
                    <span className="font-medium">截止日期：</span>
                    {project.end_date}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${project.status === 'active' ? 'bg-green-100 text-green-800' : project.status === 'completed' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>
                    {project.status === 'active' ? '进行中' : project.status === 'completed' ? '已完成' : '已延期'}
                  </span>
                  <Button variant="secondary" size="sm" asChild>
                    <Link href={`/projects/${project.id}`}>
                      查看详情
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}

export default ProjectsPage