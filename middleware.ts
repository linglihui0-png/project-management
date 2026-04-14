import { NextRequest, NextResponse } from 'next/server'

// 中间件函数
export async function middleware(req: NextRequest) {
  // 对所有路由无条件放行
  return NextResponse.next()
}

// 配置中间件适用的路径
export const config = {
  matcher: [
    /*
     * 匹配所有请求路径，除了：
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
