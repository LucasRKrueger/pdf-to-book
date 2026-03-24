import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react'
import { useReaderStore } from '@/shared/model/readerStore'

export function BottomBar() {
  const { currentPage, totalPages, scale, goToPage, setScale, setFitMode } = useReaderStore()
  const progress = totalPages > 0 ? (currentPage / totalPages) * 100 : 0

  return (
    <div
      className="sm:hidden flex-shrink-0 border-t"
      style={{
        background: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {/* Progress line */}
      <div className="h-0.5" style={{ background: 'var(--color-surface-2)' }}>
        <div
          className="h-full transition-all duration-300"
          style={{ width: `${progress}%`, background: 'var(--color-accent)' }}
        />
      </div>

      <div className="flex items-center justify-between px-3 py-2 gap-2">
        {/* Prev */}
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage <= 1}
          className="flex items-center gap-1 px-3 py-2.5 rounded-lg text-sm font-medium disabled:opacity-30 transition-all active:scale-95"
          style={{ background: 'var(--color-surface-2)', color: 'var(--color-text)' }}
          aria-label="Previous page"
        >
          <ChevronLeft size={18} />
          <span>Prev</span>
        </button>

        {/* Page counter */}
        <span className="text-sm tabular-nums shrink-0" style={{ color: 'var(--color-text-muted)' }}>
          {currentPage} <span style={{ color: 'var(--color-border)' }}>/</span> {totalPages}
        </span>

        {/* Zoom controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setScale(Math.max(0.25, scale - 0.2))}
            className="p-2 rounded-lg transition-all active:scale-95"
            style={{ background: 'var(--color-surface-2)', color: 'var(--color-text)' }}
            aria-label="Zoom out"
          >
            <ZoomOut size={16} />
          </button>
          <button
            onClick={() => setFitMode('page')}
            className="p-2 rounded-lg transition-all active:scale-95"
            style={{ background: 'var(--color-surface-2)', color: 'var(--color-text)' }}
            aria-label="Fit page"
            title="Reset zoom"
          >
            <Maximize2 size={16} />
          </button>
          <button
            onClick={() => setScale(Math.min(4, scale + 0.2))}
            className="p-2 rounded-lg transition-all active:scale-95"
            style={{ background: 'var(--color-surface-2)', color: 'var(--color-text)' }}
            aria-label="Zoom in"
          >
            <ZoomIn size={16} />
          </button>
        </div>

        {/* Next */}
        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="flex items-center gap-1 px-3 py-2.5 rounded-lg text-sm font-medium disabled:opacity-30 transition-all active:scale-95"
          style={{ background: 'var(--color-surface-2)', color: 'var(--color-text)' }}
          aria-label="Next page"
        >
          <span>Next</span>
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  )
}
