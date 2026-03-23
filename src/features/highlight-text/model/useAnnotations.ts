import { useState, useEffect, useCallback } from 'react'
import type { Annotation } from '@/shared/types/annotation'
import { getAnnotations, addAnnotation, deleteAnnotation, updateAnnotation } from '@/shared/db/queries'

export function useAnnotations(bookId: number | null, pageNumber: number) {
  const [annotations, setAnnotations] = useState<Annotation[]>([])

  const load = useCallback(async () => {
    if (!bookId) return
    const data = await getAnnotations(bookId, pageNumber)
    setAnnotations(data)
  }, [bookId, pageNumber])

  useEffect(() => { load() }, [load])

  const add = useCallback(async (annotation: Omit<Annotation, 'id'>) => {
    await addAnnotation(annotation)
    await load()
  }, [load])

  const remove = useCallback(async (id: number) => {
    await deleteAnnotation(id)
    setAnnotations((prev) => prev.filter((a) => a.id !== id))
  }, [])

  const update = useCallback(async (id: number, changes: Partial<Annotation>) => {
    await updateAnnotation(id, changes)
    await load()
  }, [load])

  return { annotations, add, remove, update, reload: load }
}
