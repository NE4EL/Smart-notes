import { useState } from 'react'
import { Link } from 'react-router-dom'

import { FilterPanel } from '../components/FilterPanel'
import { NoteList } from '../components/NoteList'
import { SearchBar } from '../components/SearchBar'
import { useNotes } from '../hooks/useNotes'
import { useSpaces } from '../hooks/useSpaces'
import { useTags } from '../hooks/useTags'
import type { NoteFilters } from '../types'

export function NotesPage() {
  const [filters, setFilters] = useState<NoteFilters>({
    scope: 'mine', ordering: '-updated_at', page: 1,
  })
  const notes = useNotes(filters)
  const spaces = useSpaces()
  const tags = useTags()

  return (
    <section>
      <div className="note-tabs">
        <button
          className={filters.scope === 'mine' ? 'active' : ''}
          onClick={() => setFilters({ scope: 'mine', ordering: '-updated_at', page: 1 })}
          type="button"
        >
          Мои заметки
        </button>
        <button
          className={filters.scope === 'shared' ? 'active' : ''}
          onClick={() => setFilters({ scope: 'shared', ordering: '-updated_at', page: 1 })}
          type="button"
        >
          Общие заметки
        </button>
      </div>
      <div className="page-toolbar">
        <SearchBar
          onChange={(search) => setFilters({ ...filters, search, page: 1 })}
          value={filters.search || ''}
        />
        <Link className="primary-button" to="/notes/new">
          Новая заметка
        </Link>
      </div>

      {filters.scope === 'mine' && (
        <FilterPanel
          filters={filters}
          onChange={(nextFilters) => setFilters({ ...nextFilters, page: 1 })}
          spaces={spaces.data || []}
          tags={tags.data || []}
        />
      )}

      {notes.isLoading && <div className="empty-state">Загрузка...</div>}
      {notes.isError && <div className="error">Не удалось загрузить заметки</div>}
      {notes.data && (
        <NoteList
          notes={notes.data.results}
          spaces={spaces.data || []}
          tags={tags.data || []}
        />
      )}

      {notes.data && (notes.data.previous || notes.data.next) && (
        <div className="pagination">
          <button
            disabled={!notes.data.previous}
            onClick={() => setFilters({ ...filters, page: Math.max(1, (filters.page || 1) - 1) })}
            type="button"
          >
            Назад
          </button>
          <span>Страница {filters.page || 1}</span>
          <button
            disabled={!notes.data.next}
            onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}
            type="button"
          >
            Далее
          </button>
        </div>
      )}
    </section>
  )
}
