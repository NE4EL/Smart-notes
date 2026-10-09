import type { Note, NoteFilters, NoteInput, Paginated } from '../types'
import { apiClient } from './client'

export async function getNotes(filters: NoteFilters = {}) {
  const params = {
    ...filters,
    tags: filters.tags?.join(','),
  }
  const response = await apiClient.get<Paginated<Note>>('/notes', { params })
  return response.data
}

export async function getNote(id: number) {
  const response = await apiClient.get<Note>(`/notes/${id}`)
  return response.data
}

export async function createNote(note: NoteInput) {
  const response = await apiClient.post<Note>('/notes', note)
  return response.data
}

export async function updateNote(id: number, note: NoteInput) {
  const response = await apiClient.put<Note>(`/notes/${id}`, note)
  return response.data
}

export async function shareNote(id: number, email: string) {
  const response = await apiClient.post<Note>(`/notes/${id}/share`, { email })
  return response.data
}

export async function unshareNote(id: number, email: string) {
  const response = await apiClient.delete<Note>(`/notes/${id}/share`, {
    data: { email },
  })
  return response.data
}

export async function patchNote(id: number, note: Partial<NoteInput>) {
  const response = await apiClient.patch<Note>(`/notes/${id}`, note)
  return response.data
}

export async function deleteNote(id: number) {
  await apiClient.delete(`/notes/${id}`)
}

export function togglePin(id: number, value: boolean) {
  return patchNote(id, { is_pinned: value })
}
