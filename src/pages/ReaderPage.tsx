import { useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import { useReaderStore } from '@/shared/model/readerStore'
import { useUiStore } from '@/shared/model/uiStore'
import {
  usePdfDocument,
  useReadingPosition,
  useKeyboardNavigation,
  useFitScale,
  useBookLoader,
} from '@/features/read-pdf'
import { useGestures } from '@/shared/lib/hooks/useGestures'
import { PageRenderer, ReaderToolbar, BottomBar } from '@/widgets/reader'
import { Sidebar } from '@/widgets/sidebar'
import { Spinner } from '@/shared/ui/atoms/Spinner'

function parseSafeBookId(raw: string | undefined): number | null {
  const n = Number(raw)
  return raw && !isNaN(n) && n > 0 ? n : null
}

export function ReaderPage() {
  const { bookId: bookIdStr } = useParams<{ bookId: string }>()
  const navigate = useNavigate()
  const bookId = parseSafeBookId(bookIdStr)

  const { pdfDocument, currentPage, scale, goToPage, setScale, reset, pdfLoadError } = useReaderStore()
  const { sidebarOpen } = useUiStore()
  const viewportRef = useRef<HTMLDivElement>(null)
  const pageWrapperRef = useRef<HTMLDivElement>(null)

  const { pdfData, bookTitle, dbError } = useBookLoader(bookId)

  usePdfDocument(pdfData)
  useReadingPosition(bookId)
  useKeyboardNavigation()
  useFitScale(viewportRef)

  const { onPointerDown, onPointerMove, onPointerUp, onPointerCancel } = useGestures({
    onSwipeLeft: () => goToPage(useReaderStore.getState().currentPage + 1),
    onSwipeRight: () => goToPage(useReaderStore.getState().currentPage - 1),
    onTap: (relX) => {
      if (window.getSelection()?.toString()) return
      if (relX < 0.3) goToPage(useReaderStore.getState().currentPage - 1)
      else if (relX > 0.7) goToPage(useReaderStore.getState().currentPage + 1)
    },
    onPinchMove: (ratio) => {
      if (pageWrapperRef.current) {
        pageWrapperRef.current.style.transform = `scale(${ratio})`
        pageWrapperRef.current.style.transformOrigin = 'center center'
      }
    },
    onPinchEnd: (ratio) => {
      if (pageWrapperRef.current) {
        pageWrapperRef.current.style.transform = ''
      }
      const baseScale = useReaderStore.getState().scale
      setScale(Math.max(0.25, Math.min(4, baseScale * ratio)))
    },
  })

  const error = dbError ?? pdfLoadError

  if (!bookId) { navigate('/'); return null }

  if (error) {
    return (
      <div
        className="h-full flex flex-col items-center justify-center gap-4 p-8 text-center"
        style={{ background: 'var(--color-bg)' }}
      >
        <AlertCircle size={36} style={{ color: 'var(--color-text-muted)' }} strokeWidth={1.5} />
        <div>
          <p className="font-medium" style={{ color: 'var(--color-text)' }}>Failed to open book</p>
          <p className="text-sm mt-1 max-w-sm" style={{ color: 'var(--color-text-muted)' }}>{error}</p>
        </div>
        <button
          onClick={() => { reset(); navigate('/') }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
          style={{ background: 'var(--color-accent)', color: '#fff' }}
        >
          <ArrowLeft size={16} /> Back to Library
        </button>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--color-bg)' }}>
      <ReaderToolbar bookTitle={bookTitle} />

      <div className="flex flex-1 overflow-hidden">
        <div
          ref={viewportRef}
          className="flex-1 flex items-start justify-center overflow-auto sm:items-center sm:p-6"
          style={{ background: 'var(--color-bg)', touchAction: 'pan-y' }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerCancel}
        >
          {pdfDocument && bookId ? (
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                ref={pageWrapperRef}
                key={currentPage}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.15 }}
                className="shadow-2xl overflow-hidden"
                style={{ background: '#fff', borderRadius: 2 }}
              >
                <PageRenderer
                  doc={pdfDocument}
                  pageNumber={currentPage}
                  scale={scale}
                  bookId={bookId}
                />
              </motion.div>
            </AnimatePresence>
          ) : (
            <Spinner label="Loading…" />
          )}
        </div>

        {sidebarOpen && <Sidebar />}
      </div>

      <BottomBar />
    </div>
  )
}
