// src/lib/auth.ts
import api from './api'

interface RegisterPayload {
  username: string
  email: string
  password: string
}

interface LoginPayload {
  usernameOrEmail: string
  password: string
}

export async function registerUser(payload: RegisterPayload) {
  const response = await api.post('/api/auth/register', payload)
  return response.data
}

export async function loginUser(payload: LoginPayload) {
  const response = await api.post('/api/auth/login', payload)
  return response.data
}
