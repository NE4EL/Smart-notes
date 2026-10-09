import { useState, type FormEvent } from 'react'

import {
  useCreateSpace,
  useDeleteSpace,
  useRenameSpace,
  useSpaces,
} from '../hooks/useSpaces'

export function SpacesPage() {
  const [name, setName] = useState('')
  const spaces = useSpaces()
  const create = useCreateSpace()
  const rename = useRenameSpace()
  const remove = useDeleteSpace()

  async function add(event: FormEvent) {
    event.preventDefault()
    if (!name.trim()) return
    await create.mutateAsync(name.trim())
    setName('')
  }

  async function edit(id: number, oldName: string) {
    const newName = window.prompt('Новое название', oldName)
    if (newName?.trim()) await rename.mutateAsync({ id, name: newName.trim() })
  }

  return (
    <section className="manager-page">
      <h1>Пространства</h1>
      <form className="add-row" onSubmit={add}>
        <input
          maxLength={100}
          onChange={(event) => setName(event.target.value)}
          placeholder="Название пространства"
          value={name}
        />
        <button className="primary-button" type="submit">
          Добавить
        </button>
      </form>

      <div className="simple-list">
        {spaces.data?.map((space) => (
          <div className="simple-row" key={space.id}>
            <span>{space.name}</span>
            <div>
              <button onClick={() => edit(space.id, space.name)} type="button">
                Переименовать
              </button>
              <button onClick={() => remove.mutate(space.id)} type="button">
                Удалить
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
