import type { Attachment, Paginated } from '../types'
import { apiClient } from './client'

export async function getAttachments(noteId: number) {
  const response = await apiClient.get<Paginated<Attachment>>(
    `/notes/${noteId}/attachments`,
  )
  return response.data.results
}

export async function uploadAttachment(noteId: number, file: File) {
  const form = new FormData()
  form.append('file', file)
  const response = await apiClient.post<Attachment>(
    `/notes/${noteId}/attachments`,
    form,
  )
  return response.data
}

export async function deleteAttachment(id: number) {
  await apiClient.delete(`/attachments/${id}`)
}
