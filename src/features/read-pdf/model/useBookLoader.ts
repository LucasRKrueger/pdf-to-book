import { useState, useEffect } from 'react'
import { getBookData } from '@/shared/db/queries'
import { useReaderStore } from '@/shared/model/readerStore'

interface BookLoaderResult {
  pdfData: ArrayBuffer | null
  bookTitle: string
  dbError: string | null
}

export function useBookLoader(bookId: number | null): BookLoaderResult {
  const setActiveBook = useReaderStore((s) => s.setActiveBook)
  const setLoading = useReaderStore((s) => s.setLoading)
  const [pdfData, setPdfData] = useState<ArrayBuffer | null>(null)
  const [bookTitle, setBookTitle] = useState('')
  const [dbError, setDbError] = useState<string | null>(null)

  useEffect(() => {
    if (!bookId) return
    setActiveBook(bookId)
    setLoading(true)
    setDbError(null)
    setPdfData(null)

    getBookData(bookId)
      .then((book) => {
        if (!book) {
          setDbError('Book not found.')
          setLoading(false)
          return
        }
        setBookTitle(book.title)
        setPdfData(book.pdfData)
      })
      .catch(() => {
        setDbError('Could not load book from storage. The database may be corrupted.')
        setLoading(false)
      })
  }, [bookId, setActiveBook, setLoading])

  return { pdfData, bookTitle, dbError }
}
