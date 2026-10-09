import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

import { LoginPage } from './LoginPage'

describe('LoginPage UI', () => {
  test('has clear labels and keyboard order', async () => {
    const user = userEvent.setup()
    const queryClient = new QueryClient()

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </QueryClientProvider>,
    )

    expect(screen.getByRole('heading', { name: 'Вход' })).toBeVisible()
    expect(screen.getByLabelText('Email')).toBeVisible()
    expect(screen.getByLabelText('Пароль')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Войти' })).toBeVisible()

    await user.tab()
    expect(screen.getByLabelText('Email')).toHaveFocus()
    await user.tab()
    expect(screen.getByLabelText('Пароль')).toHaveFocus()
  })
})
