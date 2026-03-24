import { useState, useEffect, useCallback } from 'react'
import type { Annotation } from '@/shared/types/annotation'
import { getAnnotations, addAnnotation, deleteAnnotation, updateAnnotation } from '@/shared/db/queries'
import { useAnnotationBus } from '@/shared/model/annotationBus'

export function useAnnotations(bookId: number | null, pageNumber: number) {
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const busV = useAnnotationBus((s) => s.v)
  const bump = useAnnotationBus.getState().bump

  const load = useCallback(async () => {
    if (!bookId) return
    const data = await getAnnotations(bookId, pageNumber)
    setAnnotations(data)
  }, [bookId, pageNumber])

  useEffect(() => { load() }, [load, busV])

  const add = useCallback(async (annotation: Omit<Annotation, 'id'>) => {
    await addAnnotation(annotation)
    bump()
  }, [bump])

  const remove = useCallback(async (id: number) => {
    await deleteAnnotation(id)
    setAnnotations((prev) => prev.filter((a) => a.id !== id))
    bump()
  }, [bump])

  const update = useCallback(async (id: number, changes: Partial<Annotation>) => {
    await updateAnnotation(id, changes)
    bump()
  }, [bump])

  return { annotations, add, remove, update, reload: load }
}
