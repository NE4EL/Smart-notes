import type { Paginated, Tag } from '../types'
import { apiClient } from './client'

export async function getTags() {
  const response = await apiClient.get<Paginated<Tag>>('/tags')
  return response.data.results
}

export async function createTag(name: string) {
  const response = await apiClient.post<Tag>('/tags', { name })
  return response.data
}

export async function deleteTag(id: number) {
  await apiClient.delete(`/tags/${id}`)
}
