import { beforeEach, describe, expect, test, vi } from 'vitest'

import { apiClient } from './client'
import { getNotes } from './notes'

vi.mock('./client', () => ({
  apiClient: {
    get: vi.fn(),
  },
}))

describe('notes API', () => {
  beforeEach(() => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: { count: 0, next: null, previous: null, results: [] },
    })
  })

  test('converts selected tag ids into API format', async () => {
    await getNotes({ search: 'экзамен', tags: [1, 4], page: 2 })

    expect(apiClient.get).toHaveBeenCalledWith('/notes', {
      params: {
        search: 'экзамен',
        tags: '1,4',
        page: 2,
      },
    })
  })
})
