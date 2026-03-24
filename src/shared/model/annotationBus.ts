import { create } from 'zustand'

/**
 * Shared mutation bus for annotations.
 * Any hook that mutates annotations bumps `v`; any hook that reads annotations
 * subscribes to `v` so it reloads automatically after mutations from other components.
 */
interface AnnotationBusState {
  v: number
  bump: () => void
}

export const useAnnotationBus = create<AnnotationBusState>((set) => ({
  v: 0,
  bump: () => set((s) => ({ v: s.v + 1 })),
}))
