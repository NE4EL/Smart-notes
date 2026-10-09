import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createNote,
  deleteNote,
  getNote,
  getNotes,
  togglePin,
  updateNote,
} from '../api/notes'
import { queryKeys } from '../lib/queryKeys'
import type { NoteFilters, NoteInput } from '../types'

export function useNotes(filters: NoteFilters = {}) {
  return useQuery({
    queryKey: [...queryKeys.notes, filters],
    queryFn: () => getNotes(filters),
  })
}

export function useNote(id: number) {
  return useQuery({
    queryKey: queryKeys.note(id),
    queryFn: () => getNote(id),
    enabled: id > 0,
  })
}

export function useCreateNote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createNote,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.notes }),
  })
}

export function useUpdateNote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, note }: { id: number; note: NoteInput }) =>
      updateNote(id, note),
    onSuccess: (note) => {
      queryClient.setQueryData(queryKeys.note(note.id), note)
      queryClient.invalidateQueries({ queryKey: queryKeys.notes })
    },
  })
}

export function useDeleteNote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteNote,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.notes }),
  })
}

export function useTogglePin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, value }: { id: number; value: boolean }) =>
      togglePin(id, value),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.notes }),
  })
}
