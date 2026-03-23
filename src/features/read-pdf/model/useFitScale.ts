import { useEffect } from 'react'
import { useReaderStore } from '@/shared/model/readerStore'
import { getScaleForFit } from '@/shared/lib/pdf/engine'

export function useFitScale(viewportRef: React.RefObject<HTMLElement | null>) {
  const pdfDocument = useReaderStore((s) => s.pdfDocument)
  const currentPage = useReaderStore((s) => s.currentPage)
  const fitMode = useReaderStore((s) => s.fitMode)
  const setScale = useReaderStore((s) => s.setScale)

  useEffect(() => {
    if (!pdfDocument || !viewportRef.current || fitMode === 'custom') return
    let cancelled = false

    pdfDocument.getPage(currentPage).then((page) => {
      if (cancelled || !viewportRef.current) return
      const { width, height } = viewportRef.current.getBoundingClientRect()
      const isMobile = window.innerWidth < 640
      const hPad = isMobile ? 0 : 48
      const vPad = isMobile ? 0 : 48
      const computed = getScaleForFit(page, width - hPad, height - vPad, fitMode as 'width' | 'page')
      setScale(Math.min(1.0, computed))
    })

    return () => { cancelled = true }
  }, [pdfDocument, currentPage, fitMode, setScale, viewportRef])
}
