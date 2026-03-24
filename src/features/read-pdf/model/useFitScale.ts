import { useEffect, useRef } from 'react'
import { useReaderStore } from '@/shared/model/readerStore'
import { getScaleForFit } from '@/shared/lib/pdf/engine'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import type { FitMode } from '@/shared/model/readerStore'

export function useFitScale(viewportRef: React.RefObject<HTMLElement | null>) {
  const pdfDocument = useReaderStore((s) => s.pdfDocument)
  const currentPage = useReaderStore((s) => s.currentPage)
  const fitMode = useReaderStore((s) => s.fitMode)
  const setScale = useReaderStore((s) => s.setScale)

  // Refs so the ResizeObserver callback always has fresh values without re-subscribing
  const pdfDocRef = useRef<PDFDocumentProxy | null>(pdfDocument)
  const pageRef = useRef(currentPage)
  const fitModeRef = useRef<FitMode>(fitMode)
  const setScaleRef = useRef(setScale)
  pdfDocRef.current = pdfDocument
  pageRef.current = currentPage
  fitModeRef.current = fitMode
  setScaleRef.current = setScale

  async function recompute(el: HTMLElement) {
    const doc = pdfDocRef.current
    const mode = fitModeRef.current
    if (!doc || mode === 'custom') return
    const page = await doc.getPage(pageRef.current)
    const { width, height } = el.getBoundingClientRect()
    const isMobile = window.innerWidth < 640
    const hPad = isMobile ? 0 : 48
    const vPad = isMobile ? 0 : 48
    const computed = getScaleForFit(page, width - hPad, height - vPad, mode as 'width' | 'page')
    setScaleRef.current(computed)
  }

  // Re-compute whenever PDF, page, or fitMode changes
  useEffect(() => {
    if (!viewportRef.current) return
    let cancelled = false
    const el = viewportRef.current
    const doc = pdfDocument
    const mode = fitMode
    if (!doc || mode === 'custom') return

    doc.getPage(currentPage).then((page) => {
      if (cancelled || !viewportRef.current) return
      const { width, height } = el.getBoundingClientRect()
      const isMobile = window.innerWidth < 640
      const hPad = isMobile ? 0 : 48
      const vPad = isMobile ? 0 : 48
      const computed = getScaleForFit(page, width - hPad, height - vPad, mode as 'width' | 'page')
      setScale(computed)
    })

    return () => { cancelled = true }
  }, [pdfDocument, currentPage, fitMode, setScale, viewportRef])

  // Re-compute on container resize (handles orientation change, browser chrome resize)
  useEffect(() => {
    const el = viewportRef.current
    if (!el) return
    const ro = new ResizeObserver(() => { recompute(el) })
    ro.observe(el)
    return () => ro.disconnect()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewportRef])
}
