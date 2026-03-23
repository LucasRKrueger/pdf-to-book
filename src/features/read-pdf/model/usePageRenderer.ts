import { useEffect, useRef, useCallback } from 'react'
import type { PDFDocumentProxy, PDFPageProxy, RenderTask } from 'pdfjs-dist'

interface UsePageRendererOptions {
  doc: PDFDocumentProxy | null
  pageNumber: number
  scale: number
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  onPageReady?: (page: PDFPageProxy) => void
}

export function usePageRenderer({ doc, pageNumber, scale, canvasRef, onPageReady }: UsePageRendererOptions) {
  const renderTaskRef = useRef<RenderTask | null>(null)
  const pageRef = useRef<PDFPageProxy | null>(null)

  const render = useCallback(async () => {
    if (!doc || !canvasRef.current) return

    renderTaskRef.current?.cancel()

    const canvas = canvasRef.current
    const page = await doc.getPage(pageNumber)
    pageRef.current = page

    const dpr = window.devicePixelRatio || 1
    const viewport = page.getViewport({ scale: scale * dpr })

    canvas.width = viewport.width
    canvas.height = viewport.height
    canvas.style.width = `${Math.floor(viewport.width / dpr)}px`
    canvas.style.height = `${Math.floor(viewport.height / dpr)}px`

    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const task = page.render({ canvasContext: ctx, viewport })
    renderTaskRef.current = task

    try {
      await task.promise
      onPageReady?.(page)
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'RenderingCancelledException') return
    }
  }, [doc, pageNumber, scale, canvasRef, onPageReady])

  useEffect(() => {
    render()
    return () => {
      renderTaskRef.current?.cancel()
    }
  }, [render])

  return { pageRef }
}
