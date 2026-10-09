import type { AuthTokens, User } from '../types'
import { apiClient } from './client'

export async function register(email: string, password: string, name: string) {
  const response = await apiClient.post<User>('/auth/register', {
    email,
    password,
    name,
  })
  return response.data
}

export async function login(email: string, password: string) {
  const response = await apiClient.post<AuthTokens>('/auth/login', {
    email,
    password,
  })
  return response.data
}

export async function refresh(refreshToken: string) {
  const response = await apiClient.post<AuthTokens>('/auth/refresh', {
    refresh: refreshToken,
  })
  return response.data
}

export async function logout(refreshToken: string) {
  await apiClient.post('/auth/logout', { refresh: refreshToken })
}
