import { useState, useEffect, useCallback } from 'react'
import type { Annotation } from '@/shared/types/annotation'
import { getAllAnnotations, deleteAnnotation } from '@/shared/db/queries'
import { useAnnotationBus } from '@/shared/model/annotationBus'

export function useAllAnnotations(bookId: number | null) {
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const busV = useAnnotationBus((s) => s.v)
  const bump = useAnnotationBus.getState().bump

  const load = useCallback(async () => {
    if (!bookId) return
    const data = await getAllAnnotations(bookId)
    setAnnotations(data)
  }, [bookId])

  useEffect(() => { load() }, [load, busV])

  const remove = useCallback(async (id: number) => {
    await deleteAnnotation(id)
    setAnnotations((prev) => prev.filter((a) => a.id !== id))
    bump()
  }, [bump])

  return { annotations, remove }
}
