import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

import { login } from '../api/auth'
import { getRefreshToken, getToken } from '../lib/auth'
import { LoginPage } from './LoginPage'

vi.mock('../api/auth', () => ({
  login: vi.fn(),
  logout: vi.fn(),
  register: vi.fn(),
}))

describe('login integration', () => {
  test('submits form, saves tokens and opens notes page', async () => {
    vi.mocked(login).mockResolvedValue({
      access: 'access-token',
      refresh: 'refresh-token',
    })
    const user = userEvent.setup()
    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    })

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<div>Список заметок</div>} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    )

    await user.type(screen.getByLabelText('Email'), 'student@example.com')
    await user.type(screen.getByLabelText('Пароль'), 'strongpass123')
    await user.click(screen.getByRole('button', { name: 'Войти' }))

    expect(await screen.findByText('Список заметок')).toBeVisible()
    expect(login).toHaveBeenCalledWith('student@example.com', 'strongpass123')
    expect(getToken()).toBe('access-token')
    expect(getRefreshToken()).toBe('refresh-token')
  })
})
