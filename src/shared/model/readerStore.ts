import { create } from 'zustand'
import type { PDFDocumentProxy } from 'pdfjs-dist'

export type FitMode = 'width' | 'page' | 'custom'

interface ReaderState {
  activeBookId: number | null
  currentPage: number
  totalPages: number
  scale: number
  fitMode: FitMode
  isLoading: boolean
  pdfLoadError: string | null
  pdfDocument: PDFDocumentProxy | null

  setActiveBook: (bookId: number | null) => void
  setPdfDocument: (doc: PDFDocumentProxy | null) => void
  goToPage: (page: number) => void
  setScale: (scale: number) => void
  setFitMode: (mode: FitMode) => void
  setLoading: (loading: boolean) => void
  setPdfLoadError: (err: string | null) => void
  reset: () => void
}

const DEFAULT: Omit<ReaderState,
  'setActiveBook' | 'setPdfDocument' | 'goToPage' | 'setScale' | 'setFitMode' | 'setLoading' | 'setPdfLoadError' | 'reset'
> = {
  activeBookId: null,
  currentPage: 1,
  totalPages: 0,
  scale: 1,
  fitMode: 'width',
  isLoading: false,
  pdfLoadError: null,
  pdfDocument: null,
}

export const useReaderStore = create<ReaderState>((set, get) => ({
  ...DEFAULT,

  setActiveBook: (bookId) => set({ activeBookId: bookId }),

  setPdfDocument: (doc) => set({
    pdfDocument: doc,
    totalPages: doc?.numPages ?? 0,
  }),

  goToPage: (page) => {
    const { totalPages } = get()
    const clamped = Math.max(1, Math.min(page, totalPages))
    set({ currentPage: clamped })
  },

  setScale: (scale) => set({ scale, fitMode: 'custom' }),

  setFitMode: (fitMode) => set({ fitMode }),

  setLoading: (isLoading) => set({ isLoading }),

  setPdfLoadError: (pdfLoadError) => set({ pdfLoadError, isLoading: false }),

  reset: () => set({ ...DEFAULT }),
}))
