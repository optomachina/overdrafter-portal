import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Public routes that don't require auth
  const publicRoutes = ['/login', '/auth/callback', '/']
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }
  
  // Check for auth cookie
  const authCookie = request.cookies.get('sb-access-token')
  
  if (!authCookie) {
    // Redirect to login
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(loginUrl)
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/project/:path*', '/upload/:path*']
}