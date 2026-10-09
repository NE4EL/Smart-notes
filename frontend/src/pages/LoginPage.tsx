import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { useAuth } from '../hooks/useAuth'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const auth = useAuth()
  const navigate = useNavigate()

  async function submit(event: FormEvent) {
    event.preventDefault()
    await auth.login.mutateAsync({ email, password })
    navigate('/')
  }

  return (
    <div className="auth-screen">
      <form className="dialog" onSubmit={submit}>
        <div className="dialog-title">Умные заметки</div>
        <h1>Вход</h1>

        <label className="field">
          <span>Email</span>
          <input
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            value={email}
          />
        </label>

        <label className="field">
          <span>Пароль</span>
          <input
            minLength={8}
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
        </label>

        {auth.login.isError && <div className="error">Неверный email или пароль</div>}

        <button className="primary-button" disabled={auth.login.isPending} type="submit">
          Войти
        </button>
        <Link className="auth-link" to="/register">
          Создать аккаунт
        </Link>
      </form>
    </div>
  )
}
