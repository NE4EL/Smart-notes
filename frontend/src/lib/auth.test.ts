import { clearTokens, getRefreshToken, getToken, setTokens } from './auth'

describe('token storage', () => {
  test('saves and reads both tokens', () => {
    setTokens({ access: 'access-token', refresh: 'refresh-token' })

    expect(getToken()).toBe('access-token')
    expect(getRefreshToken()).toBe('refresh-token')
  })

  test('clears both tokens', () => {
    setTokens({ access: 'access-token', refresh: 'refresh-token' })

    clearTokens()

    expect(getToken()).toBeNull()
    expect(getRefreshToken()).toBeNull()
  })
})
