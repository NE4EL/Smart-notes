import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { useAuth } from '../hooks/useAuth'

export function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const auth = useAuth()
  const navigate = useNavigate()

  async function submit(event: FormEvent) {
    event.preventDefault()
    await auth.register.mutateAsync({ name, email, password })
    navigate('/login')
  }

  return (
    <div className="auth-screen">
      <form className="dialog" onSubmit={submit}>
        <div className="dialog-title">Умные заметки</div>
        <h1>Регистрация</h1>

        <label className="field">
          <span>Имя</span>
          <input onChange={(event) => setName(event.target.value)} value={name} />
        </label>

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
          <span>Пароль, минимум 8 символов</span>
          <input
            minLength={8}
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
        </label>

        {auth.register.isError && <div className="error">Проверьте введённые данные</div>}

        <button className="primary-button" disabled={auth.register.isPending} type="submit">
          Зарегистрироваться
        </button>
        <Link className="auth-link" to="/login">
          Уже есть аккаунт
        </Link>
      </form>
    </div>
  )
}
