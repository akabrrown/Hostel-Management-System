import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase'
import { addSecurityHeaders, handleCORS, getClientIP, isIPBlocked, detectBot } from '@/lib/security'

// Define public routes that don't require authentication
const publicRoutes = ['/login', '/signup', '/']
const protectedRoutes = ['/student', '/admin', '/porter', '/director']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const response = NextResponse.next()
  
  // 1. Core Security Layer
  const ip = getClientIP(request)
  if (await isIPBlocked(ip)) {
    return new NextResponse('Access Denied', { status: 403 })
  }
  
  addSecurityHeaders(request, response)
  handleCORS(request, response)
  
  // Redirect HTTP to HTTPS in production, but exclude localhost/127.0.0.1
  const host = request.headers.get('host') || ''
  const isLocal = host.includes('localhost') || host.includes('127.0.0.1')
  
  if (process.env.NODE_ENV === 'production' && !isLocal && request.nextUrl.protocol === 'http') {
    const httpsUrl = new URL(request.url)
    httpsUrl.protocol = 'https'
    return NextResponse.redirect(httpsUrl)
  }

  // 2. Authentication & Authorization Layer
  const token = request.cookies.get('sb-access-token')?.value
  
  // Refined route matching to avoid catching everything with '/'
  const isPublicRoute = publicRoutes.some(route => 
    route === '/' ? pathname === '/' : pathname.startsWith(route)
  )
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  // Accessing protected route without token
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

      // Handle Token-based checks
  if (token) {
      // We are migrating to a custom backend with its own JWTs.
      // For now, we decode the JWT payload to get the role.
      let userRole = 'student'
      try {
        const base64Url = token.split('.')[1]
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
        const payloadStr = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        }).join(''))
        
        const payload = JSON.parse(payloadStr)
        userRole = payload.role || 'student'
      } catch (e) {
        // Fallback to student if token payload cannot be read
      }

      const redirectMap: Record<string, string> = {
        student: '/student/dashboard',
        admin: '/admin/dashboard',
        porter: '/porter/dashboard',
        director: '/director/dashboard',
      }

      // If on public route (excluding homepage and login), redirect to THEIR dashboard
      if (isPublicRoute && pathname !== '/' && pathname !== '/login') {
        const dashboardUrl = redirectMap[userRole] || '/student/dashboard'
        return NextResponse.redirect(new URL(dashboardUrl, request.url))
      }

      // If they are on a protected route but it's not THEIR role's route
      if (isProtectedRoute) {
        // e.g. student trying to access /admin
        const isAuthorized = pathname.startsWith(`/${userRole}`)
        if (!isAuthorized) {
          const dashboardUrl = redirectMap[userRole] || '/student/dashboard'
          return NextResponse.redirect(new URL(dashboardUrl, request.url))
        }
      }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
