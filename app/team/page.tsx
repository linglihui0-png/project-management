'use client';

import React, { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface TeamMember {
  id: string
  name: string
  email: string
  role: string
  department: string
  created_at: string
}

const TeamPage: React.FC = () => {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  
  // 新成员表单数据
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    role: '',
    department: ''
  })
  
  // 当前编辑的成员数据
  const [currentMember, setCurrentMember] = useState<TeamMember>({
    id: '',
    name: '',
    email: '',
    role: '',
    department: '',
    created_at: ''
  })
  
  // 待删除的成员ID
  const [memberToDelete, setMemberToDelete] = useState<string>('')

  // 职位角色选项
  const roles = [
    '项目经理',
    '硬件工程师',
    '软件工程师',
    '结构工程师',
    '采购'
  ]

  // 获取团队成员列表
  const fetchMembers = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
      
      if (error) {
        console.error('Error fetching members:', error)
        alert(`获取成员列表失败: ${error.message}`)
      } else {
        setMembers(data || [])
      }
    } catch (error) {
      console.error('Error fetching members:', error)
      alert('获取成员列表失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  // 添加成员
  const handleAddMember = async () => {
    try {
      const { error } = await supabase
        .from('team_members')
        .insert({
          name: newMember.name,
          email: newMember.email,
          role: newMember.role,
          department: newMember.department
        })
      
      if (error) {
        console.error('Error adding member:', error)
        alert(`添加成员失败: ${error.message}`)
      } else {
        setIsAddDialogOpen(false)
        // 重置表单
        setNewMember({
          name: '',
          email: '',
          role: '',
          department: ''
        })
        // 重新获取成员列表
        fetchMembers()
      }
    } catch (error) {
      console.error('Error adding member:', error)
      alert('添加成员失败，请稍后重试')
    }
  }

  // 编辑成员
  const handleEditMember = (member: TeamMember) => {
    setCurrentMember(member)
    setIsEditDialogOpen(true)
  }

  // 更新成员
  const handleUpdateMember = async () => {
    try {
      const { error } = await supabase
        .from('team_members')
        .update({
          name: currentMember.name,
          email: currentMember.email,
          role: currentMember.role,
          department: currentMember.department
        })
        .eq('id', currentMember.id)
      
      if (error) {
        console.error('Error updating member:', error)
        alert(`更新成员失败: ${error.message}`)
      } else {
        setIsEditDialogOpen(false)
        // 重新获取成员列表
        fetchMembers()
      }
    } catch (error) {
      console.error('Error updating member:', error)
      alert('更新成员失败，请稍后重试')
    }
  }

  // 打开删除确认
  const handleDeleteMember = (memberId: string) => {
    setMemberToDelete(memberId)
    setIsDeleteDialogOpen(true)
  }

  // 确认删除
  const handleConfirmDelete = async () => {
    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', memberToDelete)
      
      if (error) {
        console.error('Error deleting member:', error)
        alert(`删除成员失败: ${error.message}`)
      } else {
        setIsDeleteDialogOpen(false)
        setMemberToDelete('')
        // 重新获取成员列表
        fetchMembers()
      }
    } catch (error) {
      console.error('Error deleting member:', error)
      alert('删除成员失败，请稍后重试')
    }
  }

  useEffect(() => {
    fetchMembers()
  }, [])

  return (
    <Layout>
      <div className="space-y-6 pt-16 pl-64">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">团队管理</h1>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-blue-600">
                添加成员
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>添加团队成员</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-medium">
                    姓名 *
                  </label>
                  <Input
                    id="name"
                    value={newMember.name}
                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                    placeholder="请输入姓名"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium">
                    邮箱 *
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={newMember.email}
                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                    placeholder="请输入邮箱"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="role" className="block text-sm font-medium">
                    职位角色 *
                  </label>
                  <Select value={newMember.role} onValueChange={(value) => setNewMember({ ...newMember, role: value })}>
                    <SelectTrigger id="role">
                      <SelectValue placeholder="请选择职位角色" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="department" className="block text-sm font-medium">
                    所属部门 *
                  </label>
                  <Input
                    id="department"
                    value={newMember.department}
                    onChange={(e) => setNewMember({ ...newMember, department: e.target.value })}
                    placeholder="请输入所属部门"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-4">
                <Button
                  variant="secondary"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  取消
                </Button>
                <Button
                  onClick={handleAddMember}
                  disabled={!newMember.name || !newMember.email || !newMember.role || !newMember.department}
                >
                  确认添加
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* 编辑成员弹窗 */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>编辑团队成员</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="edit-name" className="block text-sm font-medium">
                    姓名 *
                  </label>
                  <Input
                    id="edit-name"
                    value={currentMember.name}
                    onChange={(e) => setCurrentMember({ ...currentMember, name: e.target.value })}
                    placeholder="请输入姓名"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="edit-email" className="block text-sm font-medium">
                    邮箱 *
                  </label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={currentMember.email}
                    onChange={(e) => setCurrentMember({ ...currentMember, email: e.target.value })}
                    placeholder="请输入邮箱"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="edit-role" className="block text-sm font-medium">
                    职位角色 *
                  </label>
                  <Select value={currentMember.role} onValueChange={(value) => setCurrentMember({ ...currentMember, role: value })}>
                    <SelectTrigger id="edit-role">
                      <SelectValue placeholder="请选择职位角色" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="edit-department" className="block text-sm font-medium">
                    所属部门 *
                  </label>
                  <Input
                    id="edit-department"
                    value={currentMember.department}
                    onChange={(e) => setCurrentMember({ ...currentMember, department: e.target.value })}
                    placeholder="请输入所属部门"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-4">
                <Button
                  variant="secondary"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  取消
                </Button>
                <Button
                  onClick={handleUpdateMember}
                  disabled={!currentMember.name || !currentMember.email || !currentMember.role || !currentMember.department}
                >
                  保存修改
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* 删除确认弹窗 */}
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>确认删除</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <p>确定要删除该团队成员吗？此操作不可撤销。</p>
              </div>
              <div className="flex justify-end space-x-4">
                <Button
                  variant="secondary"
                  onClick={() => setIsDeleteDialogOpen(false)}
                >
                  取消
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleConfirmDelete}
                >
                  确认删除
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {members.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-500">
                暂无团队成员
              </div>
            ) : (
              members.map((member) => (
                <Card key={member.id}>
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold">{member.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        {member.role || '成员'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">部门：{member.department || '未设置'}</p>
                    <p className="text-sm text-gray-600">邮箱：{member.email}</p>
                  </CardContent>
                  <CardFooter className="pt-0 flex gap-2">
                    <Button variant="ghost" size="sm" className="text-sm" onClick={() => handleEditMember(member)}>
                      编辑
                    </Button>
                    <Button variant="destructive" size="sm" className="text-sm" onClick={() => handleDeleteMember(member.id)}>
                      删除
                    </Button>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </Layout>
  )
}

export default TeamPage