import { useEffect, useRef } from 'react'
import type { PDFPageProxy } from 'pdfjs-dist'
import { TextLayer as PdfTextLayer } from 'pdfjs-dist'

interface Props {
  page: PDFPageProxy | null
  scale: number
  layerRef?: React.RefObject<HTMLDivElement | null>
}

export function TextLayer({ page, scale, layerRef: externalRef }: Props) {
  const internalRef = useRef<HTMLDivElement>(null)
  const ref = externalRef ?? internalRef

  useEffect(() => {
    const container = ref.current
    if (!page || !container) return

    let cancelled = false
    let textLayer: PdfTextLayer | null = null

    container.innerHTML = ''
    const viewport = page.getViewport({ scale })
    container.style.width = `${viewport.width}px`
    container.style.height = `${viewport.height}px`

    page.getTextContent().then((textContent) => {
      if (cancelled || !container) return
      textLayer = new PdfTextLayer({ textContentSource: textContent, container, viewport })
      return textLayer.render()
    })

    return () => {
      cancelled = true
      textLayer?.cancel()
      if (container) container.innerHTML = ''
    }
  }, [page, scale, ref])

  return <div ref={ref} className="pdf-text-layer absolute inset-0" />
}
