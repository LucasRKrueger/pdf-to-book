import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trash2, BookOpen } from 'lucide-react'
import type { BookMeta } from '@/shared/types/book'
import { ProgressBar } from '@/shared/ui/atoms/ProgressBar'
import { useLibraryStore } from '@/entities/book/model/store'
import { useBookProgress } from '@/entities/book/model/useBookProgress'

interface Props {
  book: BookMeta
}

export function BookCard({ book }: Props) {
  const navigate = useNavigate()
  const removeBook = useLibraryStore((s) => s.removeBook)
  const { lastPage, isStarted } = useBookProgress(book.id, book.pageCount)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const confirmTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation()
    if (!confirmDelete) {
      setConfirmDelete(true)
      confirmTimerRef.current = setTimeout(() => setConfirmDelete(false), 3000)
      return
    }
    if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current)
    if (book.id) removeBook(book.id)
  }

  return (
    <div
      className="group relative flex flex-col rounded-xl overflow-hidden cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98]"
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
      }}
      onClick={() => book.id && navigate(`/reader/${book.id}`)}
    >
      {/* Cover */}
      <div
        className="relative aspect-[2/3] overflow-hidden flex items-center justify-center"
        style={{ background: 'var(--color-surface-2)' }}
      >
        {book.coverDataUrl ? (
          <img src={book.coverDataUrl} alt={book.title} className="w-full h-full object-cover" />
        ) : (
          <BookOpen size={48} style={{ color: 'var(--color-text-muted)' }} strokeWidth={1} />
        )}

        <button
          className={[
            'absolute top-1.5 right-1.5 p-2.5 rounded-md transition-all',
            'opacity-0 group-hover:opacity-100 [@media(hover:none)]:opacity-100',
          ].join(' ')}
          style={{
            background: confirmDelete ? '#ef4444' : 'rgba(0,0,0,0.55)',
            color: 'white',
          }}
          onClick={handleDelete}
          title={confirmDelete ? 'Tap again to delete' : 'Remove book'}
          aria-label={confirmDelete ? 'Confirm delete' : 'Remove book'}
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-1.5">
        <h3
          className="text-sm font-medium line-clamp-2 leading-snug"
          style={{ color: 'var(--color-text)' }}
          title={book.title}
        >
          {book.title}
        </h3>
        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          {book.pageCount} pages
        </p>

        <ProgressBar value={lastPage} max={book.pageCount} height={4} />

        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          {isStarted ? `Page ${lastPage} of ${book.pageCount}` : 'Not started'}
        </p>
      </div>
    </div>
  )
}
