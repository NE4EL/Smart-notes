import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createSpace,
  deleteSpace,
  getSpaces,
  renameSpace,
} from '../api/spaces'
import { queryKeys } from '../lib/queryKeys'

export function useSpaces() {
  return useQuery({ queryKey: queryKeys.spaces, queryFn: getSpaces })
}

export function useCreateSpace() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createSpace,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.spaces }),
  })
}

export function useRenameSpace() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) =>
      renameSpace(id, name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.spaces }),
  })
}

export function useDeleteSpace() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteSpace,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.spaces })
      queryClient.invalidateQueries({ queryKey: queryKeys.notes })
    },
  })
}
