import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'

import { clearTokens, getRefreshToken, getToken, setTokens } from '../lib/auth'
import type { AuthTokens } from '../types'

const baseURL = import.meta.env.VITE_API_URL || '/api'

export const apiClient = axios.create({ baseURL })

apiClient.interceptors.request.use((config) => {
  const token = getToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

type RetryRequest = InternalAxiosRequestConfig & { _retry?: boolean }

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const request = error.config as RetryRequest | undefined
    const refresh = getRefreshToken()

    const isAuthRequest = request?.url?.startsWith('/auth/')

    if (
      error.response?.status === 401 &&
      request &&
      !request._retry &&
      !isAuthRequest &&
      refresh
    ) {
      request._retry = true

      try {
        const response = await axios.post<AuthTokens>(`${baseURL}/auth/refresh`, {
          refresh,
        })
        setTokens(response.data)
        request.headers.Authorization = `Bearer ${response.data.access}`
        return apiClient(request)
      } catch {
        clearTokens()
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  },
)
