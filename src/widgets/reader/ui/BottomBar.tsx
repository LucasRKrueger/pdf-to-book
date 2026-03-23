import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useReaderStore } from '@/shared/model/readerStore'

export function BottomBar() {
  const { currentPage, totalPages, goToPage } = useReaderStore()
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

      <div className="flex items-center justify-between px-4 py-2">
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage <= 1}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium disabled:opacity-30 transition-all active:scale-95"
          style={{ background: 'var(--color-surface-2)', color: 'var(--color-text)' }}
          aria-label="Previous page"
        >
          <ChevronLeft size={18} />
          <span>Prev</span>
        </button>

        <span className="text-sm tabular-nums" style={{ color: 'var(--color-text-muted)' }}>
          {currentPage} <span style={{ color: 'var(--color-border)' }}>/</span> {totalPages}
        </span>

        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium disabled:opacity-30 transition-all active:scale-95"
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
