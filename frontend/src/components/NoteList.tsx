import type { Note, Space, Tag } from '../types'
import { NoteCard } from './NoteCard'

type Props = {
  notes: Note[]
  spaces: Space[]
  tags: Tag[]
}

export function NoteList({ notes, spaces, tags }: Props) {
  if (!notes.length) return <div className="empty-state">Заметок пока нет</div>

  return (
    <div className="note-list">
      {notes.map((note) => (
        <NoteCard key={note.id} note={note} spaces={spaces} tags={tags} />
      ))}
    </div>
  )
}
