import { useState, useEffect } from 'react'
import { getReadingPosition } from '@/shared/db/queries'

export function useBookProgress(bookId: number | undefined, _pageCount: number) {
  const [lastPage, setLastPage] = useState(1)

  useEffect(() => {
    if (!bookId) return
    getReadingPosition(bookId).then((pos) => {
      if (pos) setLastPage(pos.pageNumber)
    })
  }, [bookId])

  return {
    lastPage,
    isStarted: lastPage > 1,
  }
}
