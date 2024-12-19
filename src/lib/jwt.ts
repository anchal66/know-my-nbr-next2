// src/lib/jwt.ts
import {jwtDecode} from 'jwt-decode'

interface JWTPayload {
  sub: string
  username: string
  role: string
  onBoardingStatus: string
  iat: number
  exp: number
}

export function decodeToken(token: string): JWTPayload | null {
  try {
    return jwtDecode<JWTPayload>(token)
  } catch (error) {
    return null
  }
}

export function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token)
  if (!decoded) return true
  const currentTime = Math.floor(Date.now() / 1000)
  return decoded.exp < currentTime
}
