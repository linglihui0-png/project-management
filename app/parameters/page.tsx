'use client';

import React, { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

interface LaserParameter {
  id: string
  material: string
  power: number
  speed: number
  frequency: number
  notes: string
  created_at: string
}

const ParametersPage: React.FC = () => {
  const [parameters, setParameters] = useState<LaserParameter[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [searchKeyword, setSearchKeyword] = useState('')
  
  // 新参数表单数据
  const [newParameter, setNewParameter] = useState({
    material: '',
    power: 0,
    speed: 0,
    frequency: 0,
    notes: ''
  })
  
  // 编辑参数表单数据
  const [currentParameter, setCurrentParameter] = useState<LaserParameter | null>(null)
  
  // 要删除的参数ID
  const [parameterToDelete, setParameterToDelete] = useState<string>('')

  // 获取工艺参数列表
  const fetchParameters = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('laser_parameters')
        .select('*')
      
      if (error) {
        console.error('Error fetching parameters:', error)
      } else {
        setParameters(data || [])
      }
    } catch (error) {
      console.error('Error fetching parameters:', error)
    } finally {
      setLoading(false)
    }
  }

  // 录入新参数
  const handleCreateParameter = async () => {
    try {
      const { error } = await supabase
        .from('laser_parameters')
        .insert({
          ...newParameter
        })
      
      if (error) {
        console.error('Error creating parameter:', error)
        alert(`录入参数失败: ${error.message}`)
      } else {
        setIsCreateDialogOpen(false)
        // 重置表单
        setNewParameter({
          material: '',
          power: 0,
          speed: 0,
          frequency: 0,
          notes: ''
        })
        // 重新获取参数列表
        fetchParameters()
      }
    } catch (error) {
      console.error('Error creating parameter:', error)
      alert('录入参数失败，请稍后重试')
    }
  }

  // 编辑参数
  const handleEditParameter = async () => {
    if (!currentParameter) return
    
    try {
      const { error } = await supabase
        .from('laser_parameters')
        .update({
          material: currentParameter.material,
          power: currentParameter.power,
          speed: currentParameter.speed,
          frequency: currentParameter.frequency,
          notes: currentParameter.notes
        })
        .eq('id', currentParameter.id)
      
      if (error) {
        console.error('Error updating parameter:', error)
        alert(`更新参数失败: ${error.message}`)
      } else {
        setIsEditDialogOpen(false)
        // 重新获取参数列表
        fetchParameters()
      }
    } catch (error) {
      console.error('Error updating parameter:', error)
      alert('更新参数失败，请稍后重试')
    }
  }

  // 删除参数
  const handleDeleteParameter = async () => {
    if (!parameterToDelete) return
    
    try {
      const { error } = await supabase
        .from('laser_parameters')
        .delete()
        .eq('id', parameterToDelete)
      
      if (error) {
        console.error('Error deleting parameter:', error)
        alert(`删除参数失败: ${error.message}`)
      } else {
        setIsDeleteDialogOpen(false)
        setParameterToDelete('')
        // 重新获取参数列表
        fetchParameters()
      }
    } catch (error) {
      console.error('Error deleting parameter:', error)
      alert('删除参数失败，请稍后重试')
    }
  }

  // 打开编辑弹窗
  const openEditDialog = (parameter: LaserParameter) => {
    setCurrentParameter({ ...parameter })
    setIsEditDialogOpen(true)
  }

  // 打开删除确认弹窗
  const openDeleteDialog = (id: string) => {
    setParameterToDelete(id)
    setIsDeleteDialogOpen(true)
  }

  // 过滤后的参数列表
  const filteredParameters = parameters.filter(parameter => 
    parameter.material.toLowerCase().includes(searchKeyword.toLowerCase())
  )

  useEffect(() => {
    fetchParameters()
  }, [])

  return (
    <Layout>
      <div className="space-y-6 pt-16 pl-64">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-2xl font-bold">工艺参数库</h1>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <Input
              placeholder="搜索材质"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full md:w-64"
            />
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-blue-600">
                  录入新参数
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>录入工艺参数</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label htmlFor="material" className="block text-sm font-medium">
                      材质 *
                    </label>
                    <Input
                      id="material"
                      value={newParameter.material}
                      onChange={(e) => setNewParameter({ ...newParameter, material: e.target.value })}
                      placeholder="请输入材质"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="power" className="block text-sm font-medium">
                      功率 (%) *
                    </label>
                    <Input
                      id="power"
                      type="number"
                      value={newParameter.power}
                      onChange={(e) => setNewParameter({ ...newParameter, power: parseFloat(e.target.value) || 0 })}
                      placeholder="请输入功率"
                      min="0"
                      max="100"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="speed" className="block text-sm font-medium">
                      速度 (mm/s) *
                    </label>
                    <Input
                      id="speed"
                      type="number"
                      value={newParameter.speed}
                      onChange={(e) => setNewParameter({ ...newParameter, speed: parseFloat(e.target.value) || 0 })}
                      placeholder="请输入速度"
                      min="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="frequency" className="block text-sm font-medium">
                      频率 (kHz) *
                    </label>
                    <Input
                      id="frequency"
                      type="number"
                      value={newParameter.frequency}
                      onChange={(e) => setNewParameter({ ...newParameter, frequency: parseFloat(e.target.value) || 0 })}
                      placeholder="请输入频率"
                      min="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="notes" className="block text-sm font-medium">
                      备注
                    </label>
                    <Textarea
                      id="notes"
                      value={newParameter.notes}
                      onChange={(e) => setNewParameter({ ...newParameter, notes: e.target.value })}
                      placeholder="请输入备注"
                      rows={3}
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
                    onClick={handleCreateParameter}
                    disabled={!newParameter.material || newParameter.power <= 0 || newParameter.speed <= 0 || newParameter.frequency <= 0}
                  >
                    确认录入
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      材质
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      功率 (%)
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      速度 (mm/s)
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      频率 (kHz)
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      备注
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredParameters.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                        {searchKeyword ? '没有找到匹配的材质' : '暂无工艺参数数据'}
                      </td>
                    </tr>
                  ) : (
                    filteredParameters.map((parameter) => (
                      <tr key={parameter.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{parameter.material}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{parameter.power}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{parameter.speed}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{parameter.frequency}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{parameter.notes || '-'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button 
                            className="text-primary hover:text-blue-600 mr-3"
                            onClick={() => openEditDialog(parameter)}
                          >
                            编辑
                          </button>
                          <button 
                            className="text-red-600 hover:text-red-800"
                            onClick={() => openDeleteDialog(parameter.id)}
                          >
                            删除
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 编辑参数弹窗 */}
        {currentParameter && (
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>编辑工艺参数</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="edit-material" className="block text-sm font-medium">
                    材质 *
                  </label>
                  <Input
                    id="edit-material"
                    value={currentParameter.material}
                    onChange={(e) => setCurrentParameter({ ...currentParameter, material: e.target.value })}
                    placeholder="请输入材质"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="edit-power" className="block text-sm font-medium">
                    功率 (%) *
                  </label>
                  <Input
                    id="edit-power"
                    type="number"
                    value={currentParameter.power}
                    onChange={(e) => setCurrentParameter({ ...currentParameter, power: parseFloat(e.target.value) || 0 })}
                    placeholder="请输入功率"
                    min="0"
                    max="100"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="edit-speed" className="block text-sm font-medium">
                    速度 (mm/s) *
                  </label>
                  <Input
                    id="edit-speed"
                    type="number"
                    value={currentParameter.speed}
                    onChange={(e) => setCurrentParameter({ ...currentParameter, speed: parseFloat(e.target.value) || 0 })}
                    placeholder="请输入速度"
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="edit-frequency" className="block text-sm font-medium">
                    频率 (kHz) *
                  </label>
                  <Input
                    id="edit-frequency"
                    type="number"
                    value={currentParameter.frequency}
                    onChange={(e) => setCurrentParameter({ ...currentParameter, frequency: parseFloat(e.target.value) || 0 })}
                    placeholder="请输入频率"
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="edit-notes" className="block text-sm font-medium">
                    备注
                  </label>
                  <Textarea
                    id="edit-notes"
                    value={currentParameter.notes}
                    onChange={(e) => setCurrentParameter({ ...currentParameter, notes: e.target.value })}
                    placeholder="请输入备注"
                    rows={3}
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
                  onClick={handleEditParameter}
                  disabled={!currentParameter.material || currentParameter.power <= 0 || currentParameter.speed <= 0 || currentParameter.frequency <= 0}
                >
                  保存修改
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* 删除确认弹窗 */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>确认删除</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-gray-700">
                您确定要删除这条工艺参数吗？此操作不可撤销。
              </p>
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
                onClick={handleDeleteParameter}
              >
                确认删除
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  )
}

export default ParametersPage