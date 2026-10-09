import { useMutation } from '@tanstack/react-query'

import { login, logout, register } from '../api/auth'
import { clearTokens, getRefreshToken, getToken, setTokens } from '../lib/auth'

export function useAuth() {
  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      login(email, password),
    onSuccess: setTokens,
  })

  const registerMutation = useMutation({
    mutationFn: (data: { email: string; password: string; name: string }) =>
      register(data.email, data.password, data.name),
  })

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const refresh = getRefreshToken()
      if (refresh) await logout(refresh)
    },
    onSettled: clearTokens,
  })

  return {
    isAuthenticated: Boolean(getToken()),
    login: loginMutation,
    register: registerMutation,
    logout: logoutMutation,
  }
}
