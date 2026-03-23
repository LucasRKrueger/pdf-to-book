import { useState, useEffect, useCallback } from 'react'
import type { Bookmark } from '@/shared/types/bookmark'
import {
  getBookmarks,
  addBookmark,
  deleteBookmark,
  getBookmarkForPage,
} from '@/shared/db/queries'

export function useBookmarks(bookId: number | null) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])

  const load = useCallback(async () => {
    if (!bookId) return
    const data = await getBookmarks(bookId)
    setBookmarks(data)
  }, [bookId])

  useEffect(() => { load() }, [load])

  const toggle = useCallback(async (pageNumber: number) => {
    if (!bookId) return
    const existing = await getBookmarkForPage(bookId, pageNumber)
    if (existing?.id != null) {
      await deleteBookmark(existing.id)
    } else {
      await addBookmark({ bookId, pageNumber, createdAt: new Date() })
    }
    await load()
  }, [bookId, load])

  const isBookmarked = useCallback(
    (pageNumber: number) => bookmarks.some((b) => b.pageNumber === pageNumber),
    [bookmarks],
  )

  const remove = useCallback(async (id: number) => {
    await deleteBookmark(id)
    setBookmarks((prev) => prev.filter((b) => b.id !== id))
  }, [])

  return { bookmarks, toggle, remove, isBookmarked, reload: load }
}
