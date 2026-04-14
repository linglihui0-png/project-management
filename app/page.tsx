"use client";

import React from 'react';

export default function Page() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">项目管理工作台</h1>
        
        {/* 顶部统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm font-medium text-gray-500">进行中项目</p>
            <p className="text-2xl font-bold text-blue-600 mt-2">12</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm font-medium text-gray-500">待办任务</p>
            <p className="text-2xl font-bold text-orange-500 mt-2">48</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm font-medium text-gray-500">本周已完成</p>
            <p className="text-2xl font-bold text-green-600 mt-2">25</p>
          </div>
        </div>

        {/* 最近动态看板 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">最近动态</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <p className="text-gray-600 text-sm">✅ 仓储退料流程优化项目已启动</p>
              <p className="text-gray-600 text-sm">✅ 完成 2026 年 4 月市场调研报告</p>
              <p className="text-gray-600 text-sm">✅ 系统开发环境 Trae 已搭建完成</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
