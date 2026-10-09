export const queryKeys = {
  notes: ['notes'] as const,
  note: (id: number) => ['note', id] as const,
  spaces: ['spaces'] as const,
  tags: ['tags'] as const,
}
