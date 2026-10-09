export type User = {
  id: number
  email: string
  name: string
}

export type Space = {
  id: number
  name: string
}

export type Tag = {
  id: number
  name: string
}

export type Attachment = {
  id: number
  file: string
  uploaded_at: string
}

export type Note = {
  id: number
  owner: User
  is_owner: boolean
  title: string
  content: string
  space: number | null
  space_name: string | null
  tags: number[]
  shared_with: User[]
  is_pinned: boolean
  attachments: Attachment[]
  created_at: string
  updated_at: string
}

export type Paginated<T> = {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export type NoteFilters = {
  scope?: 'mine' | 'shared'
  search?: string
  space?: number
  tags?: number[]
  ordering?: string
  page?: number
}

export type AuthTokens = {
  access: string
  refresh: string
}

export type NoteInput = {
  title: string
  content: string
  space: number | null
  tags: number[]
  is_pinned?: boolean
}
