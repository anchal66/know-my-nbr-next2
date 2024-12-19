// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { isTokenExpired } from '@/lib/jwt'

// Protect all routes under /app by default
export function middleware(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value
  const isAuthPage = req.nextUrl.pathname.startsWith('/login') || req.nextUrl.pathname.startsWith('/register')

  if (!token && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (token && isAuthPage) {
    // If logged in and trying to go to login or register page, redirect to home
    if (!isTokenExpired(token)) {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  if (token && isTokenExpired(token)) {
    // Expired token - redirect to login
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next|api|public).*)', // adjust matcher as needed
  ],
}
