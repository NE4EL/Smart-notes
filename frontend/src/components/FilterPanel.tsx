import type { NoteFilters, Space, Tag } from '../types'

type Props = {
  filters: NoteFilters
  spaces: Space[]
  tags: Tag[]
  onChange: (filters: NoteFilters) => void
}

export function FilterPanel({ filters, spaces, tags, onChange }: Props) {
  return (
    <div className="filter-panel">
      <select
        aria-label="Пространство"
        onChange={(event) =>
          onChange({
            ...filters,
            space: event.target.value ? Number(event.target.value) : undefined,
          })
        }
        value={filters.space || ''}
      >
        <option value="">Все пространства</option>
        {spaces.map((space) => (
          <option key={space.id} value={space.id}>
            {space.name}
          </option>
        ))}
      </select>

      <select
        aria-label="Тег"
        onChange={(event) =>
          onChange({
            ...filters,
            tags: event.target.value ? [Number(event.target.value)] : undefined,
          })
        }
        value={filters.tags?.[0] || ''}
      >
        <option value="">Все теги</option>
        {tags.map((tag) => (
          <option key={tag.id} value={tag.id}>
            {tag.name}
          </option>
        ))}
      </select>

      <select
        aria-label="Сортировка"
        onChange={(event) => onChange({ ...filters, ordering: event.target.value })}
        value={filters.ordering || '-updated_at'}
      >
        <option value="-updated_at">Сначала изменённые</option>
        <option value="updated_at">Давно изменённые</option>
        <option value="-created_at">Сначала новые</option>
        <option value="created_at">Сначала старые</option>
      </select>
    </div>
  )
}
