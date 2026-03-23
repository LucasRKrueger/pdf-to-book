import { useEffect, useRef } from 'react'
import { useReaderStore } from '@/shared/model/readerStore'
import { saveReadingPosition, getReadingPosition } from '@/shared/db/queries'

const DEBOUNCE_MS = 600

export function useReadingPosition(bookId: number | null) {
  const currentPage = useReaderStore((s) => s.currentPage)
  const totalPages = useReaderStore((s) => s.totalPages)
  const goToPage = useReaderStore((s) => s.goToPage)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const restoredRef = useRef(false)
  // Holds the page we want to jump to until the PDF finishes loading
  const pendingPageRef = useRef<number | null>(null)

  // Load saved position and store as pending
  useEffect(() => {
    if (!bookId) return
    restoredRef.current = false
    pendingPageRef.current = null

    getReadingPosition(bookId).then((pos) => {
      if (pos && pos.pageNumber > 1) {
        const { totalPages: tp } = useReaderStore.getState()
        if (tp > 0) {
          goToPage(pos.pageNumber)
          restoredRef.current = true
        } else {
          pendingPageRef.current = pos.pageNumber
        }
      } else {
        restoredRef.current = true
      }
    })
  }, [bookId, goToPage])

  // Apply pending page the moment totalPages transitions from 0 → N
  useEffect(() => {
    if (totalPages === 0) return
    if (pendingPageRef.current !== null) {
      goToPage(pendingPageRef.current)
      pendingPageRef.current = null
    }
    restoredRef.current = true
  }, [totalPages, goToPage])

  // Debounced save whenever page changes (only after restore is done)
  useEffect(() => {
    if (!bookId || !restoredRef.current) return

    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      saveReadingPosition({ bookId, pageNumber: currentPage, updatedAt: new Date() })
    }, DEBOUNCE_MS)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [bookId, currentPage])
}
