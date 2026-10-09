import { NavLink, Outlet, useNavigate } from 'react-router-dom'

import { useAuth } from '../hooks/useAuth'

export function Layout() {
  const auth = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await auth.logout.mutateAsync()
    navigate('/login')
  }

  return (
    <div className="app-window">
      <header className="title-bar">
        <div className="app-title">
          <span className="app-icon">N</span>
          Умные заметки
        </div>
        <button className="window-button" onClick={handleLogout} type="button">
          Выйти
        </button>
      </header>

      <nav className="menu-bar">
        <NavLink to="/">Заметки</NavLink>
        <NavLink to="/notes/new">Новая заметка</NavLink>
        <NavLink to="/spaces">Пространства</NavLink>
        <NavLink to="/tags">Теги</NavLink>
      </nav>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}
