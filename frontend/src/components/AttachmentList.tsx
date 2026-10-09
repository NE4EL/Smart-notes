import { useState } from 'react'

import { deleteAttachment, uploadAttachment } from '../api/attachments'
import type { Attachment } from '../types'

type Props = {
  noteId: number
  attachments: Attachment[]
  onChange: () => void
}

export function AttachmentList({ noteId, attachments, onChange }: Props) {
  const [loading, setLoading] = useState(false)

  async function upload(file?: File) {
    if (!file) return
    setLoading(true)
    try {
      await uploadAttachment(noteId, file)
      onChange()
    } finally {
      setLoading(false)
    }
  }

  async function remove(id: number) {
    await deleteAttachment(id)
    onChange()
  }

  return (
    <section className="attachments">
      <div className="section-title">Вложения</div>
      {attachments.map((attachment) => (
        <div className="attachment-row" key={attachment.id}>
          <a href={attachment.file} rel="noreferrer" target="_blank">
            {attachment.file.split('/').pop()}
          </a>
          <button onClick={() => remove(attachment.id)} type="button">
            Удалить
          </button>
        </div>
      ))}
      <label className="file-button">
        {loading ? 'Загрузка...' : 'Прикрепить файл'}
        <input
          disabled={loading}
          onChange={(event) => upload(event.target.files?.[0])}
          type="file"
        />
      </label>
    </section>
  )
}
