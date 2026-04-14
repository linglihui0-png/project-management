'use client';

import React from 'react'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Menu, X, User, Bell, LogOut, Home, Folder, CheckSquare, Users } from 'lucide-react'
import Link from 'next/link'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState<any>(null)

  React.useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user)
    }
    fetchSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 左侧导航栏 */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="flex items-center justify-between p-4 border-b">
          <h1 className="text-xl font-bold text-primary">项目管理系统</h1>
          <button 
            className="md:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>
        <nav className="mt-6">
          <div className="px-4 space-y-1">
            <Link 
              href="/" 
              className="flex items-center px-4 py-2 text-gray-700 rounded-md hover:bg-gray-100"
            >
              <Home size={18} className="mr-3" />
              <span>工作台</span>
            </Link>
            <Link 
              href="/projects" 
              className="flex items-center px-4 py-2 text-gray-700 rounded-md hover:bg-gray-100"
            >
              <Folder size={18} className="mr-3" />
              <span>项目管理</span>
            </Link>
            <Link 
              href="/tasks" 
              className="flex items-center px-4 py-2 text-gray-700 rounded-md hover:bg-gray-100"
            >
              <CheckSquare size={18} className="mr-3" />
              <span>任务管理</span>
            </Link>
            <Link 
              href="/team" 
              className="flex items-center px-4 py-2 text-gray-700 rounded-md hover:bg-gray-100"
            >
              <Users size={18} className="mr-3" />
              <span>团队管理</span>
            </Link>
            <Link 
              href="/parameters" 
              className="flex items-center px-4 py-2 text-gray-700 rounded-md hover:bg-gray-100"
            >
              <CheckSquare size={18} className="mr-3" />
              <span>工艺参数</span>
            </Link>
            <div className="mt-auto pt-6 border-t border-gray-200">
              <button 
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 text-gray-700 rounded-md hover:bg-gray-100"
              >
                <LogOut size={18} className="mr-3" />
                <span>退出登录</span>
              </button>
            </div>
          </div>
        </nav>
      </div>

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col">
        {/* 顶部状态栏 */}
        <header className="bg-white shadow-sm z-40">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center">
              <button 
                className="md:hidden mr-4"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu size={20} />
              </button>
              <h2 className="text-lg font-medium">{user ? '欢迎回来' : '登录'}</h2>
            </div>
            <div className="flex items-center space-x-4">
              <button className="relative p-2 rounded-full hover:bg-gray-100">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              {user ? (
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{user.email}</span>
                  <button 
                    onClick={handleLogout}
                    className="p-2 rounded-full hover:bg-gray-100"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              ) : (
                <Link 
                  href="/login" 
                  className="text-sm font-medium text-primary hover:underline"
                >
                  登录
                </Link>
              )}
            </div>
          </div>
        </header>

        {/* 内容区 */}
        <main className="flex-1 p-4 overflow-auto">
          {children}
        </main>
      </div>

      {/* 遮罩层 */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  )
}

export default Layout