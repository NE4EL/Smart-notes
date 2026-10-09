type Props = {
  value: string
  onChange: (value: string) => void
}

export function SearchBar({ value, onChange }: Props) {
  return (
    <input
      aria-label="Поиск заметок"
      className="search-input"
      onChange={(event) => onChange(event.target.value)}
      placeholder="Поиск по заметкам..."
      type="search"
      value={value}
    />
  )
}
