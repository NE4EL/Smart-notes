import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import { Layout } from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { LoginPage } from './pages/LoginPage'
import { NoteEditorPage } from './pages/NoteEditorPage'
import { NotesPage } from './pages/NotesPage'
import { RegisterPage } from './pages/RegisterPage'
import { SpacesPage } from './pages/SpacesPage'
import { TagsPage } from './pages/TagsPage'

const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <Layout />,
        children: [
          { path: '/', element: <NotesPage /> },
          { path: '/notes/:id', element: <NoteEditorPage /> },
          { path: '/spaces', element: <SpacesPage /> },
          { path: '/tags', element: <TagsPage /> },
        ],
      },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
