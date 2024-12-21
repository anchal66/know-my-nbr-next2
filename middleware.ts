import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { isTokenExpired } from '@/lib/jwt'

export function middleware(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value
  const { pathname } = req.nextUrl

  const isAuthPage = pathname === '/login' || pathname === '/register'

  const hasToken = !!token
  const expired = token ? isTokenExpired(token) : true // If no token, treat as expired

  // If user has a valid token and is on login/register, redirect to home
  if (hasToken && !expired && isAuthPage) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  // If no token or expired token and not on auth page, redirect to login
  if ((!hasToken || expired) && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Otherwise, allow the request
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next|api|public|favicon.ico).*)',
  ],
}
