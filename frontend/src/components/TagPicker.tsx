import type { Tag } from '../types'

type Props = {
  tags: Tag[]
  value: number[]
  onChange: (value: number[]) => void
}

export function TagPicker({ tags, value, onChange }: Props) {
  function toggleTag(id: number) {
    onChange(value.includes(id) ? value.filter((tagId) => tagId !== id) : [...value, id])
  }

  return (
    <fieldset className="tag-picker">
      <legend>Теги</legend>
      {tags.length === 0 && <span className="muted">Тегов пока нет</span>}
      {tags.map((tag) => (
        <label key={tag.id}>
          <input
            checked={value.includes(tag.id)}
            onChange={() => toggleTag(tag.id)}
            type="checkbox"
          />
          {tag.name}
        </label>
      ))}
    </fieldset>
  )
}
