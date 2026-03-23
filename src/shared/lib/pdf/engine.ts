import * as pdfjsLib from 'pdfjs-dist'

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url,
).toString()

export { pdfjsLib }

export async function loadPdfDocument(data: ArrayBuffer) {
  const loadingTask = pdfjsLib.getDocument({ data: data.slice(0) })
  return loadingTask.promise
}

export async function renderPageToCanvas(
  doc: pdfjsLib.PDFDocumentProxy,
  pageNumber: number,
  canvas: HTMLCanvasElement,
  scale: number,
): Promise<pdfjsLib.PDFPageProxy> {
  const page = await doc.getPage(pageNumber)
  const viewport = page.getViewport({ scale: scale * window.devicePixelRatio })

  canvas.width = viewport.width
  canvas.height = viewport.height
  canvas.style.width = `${viewport.width / window.devicePixelRatio}px`
  canvas.style.height = `${viewport.height / window.devicePixelRatio}px`

  const ctx = canvas.getContext('2d')!
  await page.render({ canvasContext: ctx, viewport }).promise

  return page
}

export function getScaleForFit(
  page: pdfjsLib.PDFPageProxy,
  containerWidth: number,
  containerHeight: number,
  mode: 'width' | 'page',
): number {
  const viewport = page.getViewport({ scale: 1 })
  if (mode === 'width') return containerWidth / viewport.width
  return Math.min(containerWidth / viewport.width, containerHeight / viewport.height)
}
