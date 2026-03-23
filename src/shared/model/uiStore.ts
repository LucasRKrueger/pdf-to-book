import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'dark' | 'sepia' | 'light'
export type SidebarTab = 'bookmarks' | 'annotations' | 'thumbnails'

interface UiState {
  theme: Theme
  sidebarOpen: boolean
  sidebarTab: SidebarTab
  activeAnnotationId: number | null
  setTheme: (theme: Theme) => void
  toggleSidebar: () => void
  setSidebarTab: (tab: SidebarTab) => void
  setActiveAnnotation: (id: number | null) => void
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      theme: 'sepia',
      sidebarOpen: false,
      sidebarTab: 'bookmarks',
      activeAnnotationId: null,
      setTheme: (theme) => set({ theme }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarTab: (tab) => set({ sidebarTab: tab }),
      setActiveAnnotation: (id) => set({ activeAnnotationId: id }),
    }),
    {
      name: 'pdf-book-ui',
      partialize: (state) => ({ theme: state.theme }),
    },
  ),
)
