import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { createTag, deleteTag, getTags } from '../api/tags'
import { queryKeys } from '../lib/queryKeys'

export function useTags() {
  return useQuery({ queryKey: queryKeys.tags, queryFn: getTags })
}

export function useCreateTag() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createTag,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.tags }),
  })
}

export function useDeleteTag() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tags })
      queryClient.invalidateQueries({ queryKey: queryKeys.notes })
    },
  })
}
