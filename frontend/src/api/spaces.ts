import type { Paginated, Space } from '../types'
import { apiClient } from './client'

export async function getSpaces() {
  const response = await apiClient.get<Paginated<Space>>('/spaces')
  return response.data.results
}

export async function createSpace(name: string) {
  const response = await apiClient.post<Space>('/spaces', { name })
  return response.data
}

export async function renameSpace(id: number, name: string) {
  const response = await apiClient.put<Space>(`/spaces/${id}`, { name })
  return response.data
}

export async function deleteSpace(id: number) {
  await apiClient.delete(`/spaces/${id}`)
}
