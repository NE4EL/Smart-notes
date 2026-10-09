import type { Space } from '../types'

type Props = {
  spaces: Space[]
  value: number | null
  onChange: (value: number | null) => void
}

export function SpaceSelect({ spaces, value, onChange }: Props) {
  return (
    <label className="field">
      <span>Пространство</span>
      <select
        onChange={(event) =>
          onChange(event.target.value ? Number(event.target.value) : null)
        }
        value={value || ''}
      >
        <option value="">Без пространства</option>
        {spaces.map((space) => (
          <option key={space.id} value={space.id}>
            {space.name}
          </option>
        ))}
      </select>
    </label>
  )
}
