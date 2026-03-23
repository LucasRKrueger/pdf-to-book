import { useEffect, useRef } from 'react'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import { loadPdfDocument } from '@/shared/lib/pdf/engine'
import { useReaderStore } from '@/shared/model/readerStore'

export function usePdfDocument(pdfData: ArrayBuffer | null) {
  const setPdfDocument = useReaderStore((s) => s.setPdfDocument)
  const setLoading = useReaderStore((s) => s.setLoading)
  const setPdfLoadError = useReaderStore((s) => s.setPdfLoadError)
  const docRef = useRef<PDFDocumentProxy | null>(null)

  useEffect(() => {
    if (!pdfData) return
    let cancelled = false

    setLoading(true)
    setPdfLoadError(null)

    loadPdfDocument(pdfData)
      .then((doc) => {
        if (cancelled) {
          doc.destroy()
          return
        }
        docRef.current = doc
        setPdfDocument(doc)
        setLoading(false)
      })
      .catch((err) => {
        if (cancelled) return
        const msg = err instanceof Error ? err.message : 'Failed to load PDF.'
        setPdfLoadError(msg)
      })

    return () => {
      cancelled = true
      docRef.current?.destroy()
      docRef.current = null
      setPdfDocument(null)
    }
  }, [pdfData, setPdfDocument, setLoading, setPdfLoadError])
}
