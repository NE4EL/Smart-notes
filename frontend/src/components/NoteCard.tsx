import { Link } from 'react-router-dom'

import type { Note, Space, Tag } from '../types'

type Props = {
  note: Note
  spaces: Space[]
  tags: Tag[]
}

export function NoteCard({ note, spaces, tags }: Props) {
  const space = spaces.find((item) => item.id === note.space)
  const noteTags = tags.filter((tag) => note.tags.includes(tag.id))

  return (
    <Link className="note-card" to={`/notes/${note.id}`}>
      <div className="note-card-title">
        <strong>{note.title}</strong>
        {note.is_pinned && <span title="Закреплена">●</span>}
      </div>
      <p>{note.content || 'Пустая заметка'}</p>
      <div className="note-meta">
        <span>{space?.name || 'Без пространства'}</span>
        {noteTags.map((tag) => (
          <span className="tag" key={tag.id}>
            {tag.name}
          </span>
        ))}
        <time>{new Date(note.updated_at).toLocaleDateString('ru-RU')}</time>
      </div>
    </Link>
  )
}
