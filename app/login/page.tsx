'use client';

import React, { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

// 错误信息翻译函数
const translateError = (errorMessage: string): string => {
  const errorMap: Record<string, string> = {
    'Invalid login credentials': '邮箱或密码错误',
    'User already registered': '该邮箱已被注册',
    'Password should be at least 6 characters': '密码长度至少为6个字符',
    'Invalid email': '邮箱格式不正确'
  }
  
  return errorMap[errorMessage] || errorMessage
}

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        alert("登录失败: " + error.message)
        return
      }
      
      alert("登录成功！正在进入系统...")
      router.push('/')
      router.refresh() // 强制刷新，让中间件重新检查 cookie
    } catch (err) {
      alert("登录失败，请稍后重试")
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password
      })

      if (error) {
        alert("注册失败: " + error.message)
        return
      }
      
      alert("注册成功！正在进入系统...")
      router.push('/')
      router.refresh() // 强制刷新，让中间件重新检查 cookie
    } catch (err) {
      alert("注册失败，请稍后重试")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center text-primary mb-6">
          项目管理系统
        </h1>
        <h2 className="text-xl font-medium text-center mb-6">登录 / 注册</h2>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
            {error}
          </div>
        )}

        <form className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              邮箱
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="请输入邮箱"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              密码
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="请输入密码"
              required
            />
          </div>
          <div className="flex flex-col gap-3">
            <button
              type="submit"
              onClick={handleLogin}
              disabled={loading}
              className="bg-primary text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors disabled:bg-blue-300"
            >
              {loading ? '登录中...' : '登录'}
            </button>
            <button
              type="button"
              onClick={handleSignUp}
              disabled={loading}
              className="border border-primary text-primary py-2 px-4 rounded-md hover:bg-blue-50 transition-colors disabled:border-blue-300 disabled:text-blue-300"
            >
              {loading ? '注册中...' : '注册'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default LoginPage