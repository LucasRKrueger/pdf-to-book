import { create } from 'zustand'
import type { BookMeta } from '@/shared/types/book'
import { getAllBooksMeta, deleteBook as dbDeleteBook } from '@/shared/db/queries'

interface LibraryState {
  books: BookMeta[]
  isLoading: boolean
  loadLibrary: () => Promise<void>
  removeBook: (bookId: number) => Promise<void>
  refresh: () => Promise<void>
}

export const useLibraryStore = create<LibraryState>((set) => ({
  books: [],
  isLoading: false,

  loadLibrary: async () => {
    set({ isLoading: true })
    try {
      const books = await getAllBooksMeta()
      set({ books, isLoading: false })
    } catch {
      set({ isLoading: false })
    }
  },

  removeBook: async (bookId) => {
    await dbDeleteBook(bookId)
    const books = await getAllBooksMeta()
    set({ books })
  },

  refresh: async () => {
    const books = await getAllBooksMeta()
    set({ books })
  },
}))
