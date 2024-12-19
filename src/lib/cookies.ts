// src/lib/cookies.ts
import Cookies from 'js-cookie'

const TOKEN_KEY = 'auth_token'

export function setToken(token: string) {
  Cookies.set(TOKEN_KEY, token, { expires: 7 }) // expires in 7 days or as desired
}

export function getToken(): string | undefined {
  return Cookies.get(TOKEN_KEY)
}

export function removeToken() {
  Cookies.remove(TOKEN_KEY)
}
