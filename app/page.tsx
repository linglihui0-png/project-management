"use client";

import React from 'react';

export default function Page() {
  return (
    <div className="flex h-screen bg-gray-50">
      
      {/* ================= 左侧侧边栏 ================= */}
      <div className="w-64 bg-slate-900 text-white flex flex-col shadow-xl">
        <div className="p-6">
          <h1 className="text-xl font-bold tracking-wider">🛠️ 激光设备工作台</h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <a href="#" className="block px-4 py-3 bg-blue-600 rounded-lg text-white font-medium shadow-sm">
            📊 概览大盘
          </a>
          <a href="#" className="block px-4 py-3 text-gray-300 hover:bg-slate-800 hover:text-white rounded-lg transition duration-200">
            📦 仓储退料管理
          </a>
          <a href="#" className="block px-4 py-3 text-gray-300 hover:bg-slate-800 hover:text-white rounded-lg transition duration-200">
            🌍 欧美市场调研
          </a>
          <a href="#" className="block px-4 py-3 text-gray-300 hover:bg-slate-800 hover:text-white rounded-lg transition duration-200">
            ⚙️ 系统设置
          </a>
        </nav>
        
        <div className="p-4 border-t border-slate-700 bg-slate-800/50">
          <p className="text-sm text-gray-400">大主管，欢迎回来</p>
        </div>
      </div>

      {/* ================= 右侧主内容区 ================= */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">项目大盘监控</h2>

          {/* 顶部统计卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
              <p className="text-sm font-medium text-gray-500">进行中研发项目</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">12</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
              <p className="text-sm font-medium text-gray-500">待办任务 (含工程师协调)</p>
              <p className="text-3xl font-bold text-orange-500 mt-2">48</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
              <p className="text-sm font-medium text-gray-500">本周已处理退料单</p>
              <p className="text-3xl font-bold text-green-600 mt-2">25</p>
            </div>
          </div>

          {/* 最近动态看板 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/80">
              <h3 className="text-lg font-semibold text-gray-900">最近核心动态</h3>
            </div>
            <div className="p-6">
              <div className="space-y-5">
                <div className="flex items-start gap-3">
                  <span className="text-green-500 mt-0.5">✅</span>
                  <div>
                    <p className="text-gray-800 text-sm font-medium">仓储退料流程优化启动</p>
                    <p className="text-gray-500 text-xs mt-1">已草拟退料标准表格，准备通知全体工程师规范单据提交。</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-green-500 mt-0.5">✅</span>
                  <div>
                    <p className="text-gray-800 text-sm font-medium">完成 4 月市场调研报告</p>
                    <p className="text-gray-500 text-xs mt-1">桌面级紫外激光打标机欧美市场竞品分析及产品定位已归档。</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-blue-500 mt-0.5">🔄</span>
                  <div>
                    <p className="text-gray-800 text-sm font-medium">工作台 UI 界面升级</p>
                    <p className="text-gray-500 text-xs mt-1">左侧高级深色导航栏正在部署中...</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
}
