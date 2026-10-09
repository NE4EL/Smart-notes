import { useState, type FormEvent } from 'react'

import { useCreateTag, useDeleteTag, useTags } from '../hooks/useTags'

export function TagsPage() {
  const [name, setName] = useState('')
  const tags = useTags()
  const create = useCreateTag()
  const remove = useDeleteTag()

  async function add(event: FormEvent) {
    event.preventDefault()
    if (!name.trim()) return
    await create.mutateAsync(name.trim())
    setName('')
  }

  return (
    <section className="manager-page">
      <h1>Теги</h1>
      <form className="add-row" onSubmit={add}>
        <input
          maxLength={50}
          onChange={(event) => setName(event.target.value)}
          placeholder="Название тега"
          value={name}
        />
        <button className="primary-button" type="submit">
          Добавить
        </button>
      </form>

      <div className="simple-list">
        {tags.data?.map((tag) => (
          <div className="simple-row" key={tag.id}>
            <span>{tag.name}</span>
            <button onClick={() => remove.mutate(tag.id)} type="button">
              Удалить
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}
