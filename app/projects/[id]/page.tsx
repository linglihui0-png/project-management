'use client';

import React, { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
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

interface ProjectDetailsPageProps {
  params: {
    id: string
  }
}

const ProjectDetailsPage: React.FC<ProjectDetailsPageProps> = ({ params }) => {
  const { id } = params
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', id)
          .single()
        
        if (error) {
          console.error('Error fetching project:', error)
        } else {
          setProject(data)
        }
      } catch (error) {
        console.error('Error fetching project:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProject()
  }, [id])

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    )
  }

  if (!project) {
    return (
      <Layout>
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">项目详情</h1>
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-medium">项目不存在</h2>
            <p className="mt-2">未找到 ID 为 {id} 的项目</p>
            <Button asChild className="mt-4">
              <Link href="/projects">返回项目列表</Link>
            </Button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6 pt-16 pl-64">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">项目详情</h1>
          <Button asChild>
            <Link href="/projects">返回项目列表</Link>
          </Button>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">{project.name}</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">项目描述</h3>
              <p className="text-gray-700">{project.description || '无描述'}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">开始日期</h3>
                <p className="text-gray-700">{project.start_date}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">截止日期</h3>
                <p className="text-gray-700">{project.end_date}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">项目状态</h3>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${project.status === 'active' ? 'bg-green-100 text-green-800' : project.status === 'completed' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>
                  {project.status === 'active' ? '进行中' : project.status === 'completed' ? '已完成' : '已延期'}
                </span>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">创建时间</h3>
                <p className="text-gray-700">{new Date(project.created_at).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default ProjectDetailsPage