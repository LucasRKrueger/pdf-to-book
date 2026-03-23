import { useState, useEffect, useCallback } from 'react'
import type { Annotation } from '@/shared/types/annotation'
import { getAllAnnotations, deleteAnnotation } from '@/shared/db/queries'

export function useAllAnnotations(bookId: number | null) {
  const [annotations, setAnnotations] = useState<Annotation[]>([])

  const load = useCallback(async () => {
    if (!bookId) return
    const data = await getAllAnnotations(bookId)
    setAnnotations(data)
  }, [bookId])

  useEffect(() => { load() }, [load])

  const remove = useCallback(async (id: number) => {
    await deleteAnnotation(id)
    setAnnotations((prev) => prev.filter((a) => a.id !== id))
  }, [])

  return { annotations, remove }
}
