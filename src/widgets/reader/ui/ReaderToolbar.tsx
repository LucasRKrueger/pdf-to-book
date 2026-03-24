import { Bookmark, BookmarkCheck, PanelRight, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useReaderStore } from '@/shared/model/readerStore'
import { useUiStore } from '@/shared/model/uiStore'
import { useBookmarks } from '@/features/bookmark-page'
import { IconButton } from '@/shared/ui/atoms/IconButton'
import { PageCounter } from '@/shared/ui/molecules/PageCounter'
import { ZoomControls } from '@/shared/ui/molecules/ZoomControls'

interface Props {
  bookTitle: string
}

export function ReaderToolbar({ bookTitle }: Props) {
  const navigate = useNavigate()
  const { activeBookId, currentPage, totalPages, scale, goToPage, setScale, setFitMode } = useReaderStore()
  const { toggleSidebar } = useUiStore()
  const { toggle: toggleBookmark, isBookmarked } = useBookmarks(activeBookId)
  const bookmarked = isBookmarked(currentPage)

  return (
    <header
      className="flex items-center gap-1 px-2 flex-shrink-0 border-b"
      style={{
        background: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
        minHeight: 48,
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingLeft: 'max(0.5rem, env(safe-area-inset-left))',
        paddingRight: 'max(0.5rem, env(safe-area-inset-right))',
      }}
    >
      <IconButton label="Back to library" onClick={() => navigate('/')}>
        <ArrowLeft size={18} />
      </IconButton>

      {/* Desktop: full title */}
      <span
        className="text-sm font-medium truncate hidden sm:block flex-1 min-w-0 mx-1"
        style={{ color: 'var(--color-text)' }}
        title={bookTitle}
      >
        {bookTitle}
      </span>

      {/* Mobile: centred title, shrinks to nothing if too long */}
      <span
        className="text-xs font-medium truncate sm:hidden flex-1 min-w-0 text-center mx-1"
        style={{ color: 'var(--color-text-muted)' }}
      >
        {bookTitle}
      </span>

      <div className="hidden sm:block">
        <PageCounter currentPage={currentPage} totalPages={totalPages} onGoToPage={goToPage} />
      </div>

      <div className="hidden sm:flex">
        <ZoomControls
          scale={scale}
          onZoomIn={() => setScale(Math.min(4, scale + 0.15))}
          onZoomOut={() => setScale(Math.max(0.25, scale - 0.15))}
          onFitWidth={() => setFitMode('page')}
        />
      </div>

      <IconButton
        label={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
        onClick={() => activeBookId && toggleBookmark(currentPage)}
        active={bookmarked}
        activeColor="var(--color-accent)"
      >
        {bookmarked ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
      </IconButton>

      <IconButton label="Toggle sidebar" onClick={toggleSidebar}>
        <PanelRight size={18} />
      </IconButton>
    </header>
  )
}
