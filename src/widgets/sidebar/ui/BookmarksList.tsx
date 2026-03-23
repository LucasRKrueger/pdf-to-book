import { Bookmark, Trash2 } from 'lucide-react'
import { useReaderStore } from '@/shared/model/readerStore'
import { useBookmarks } from '@/features/bookmark-page'

export function BookmarksList() {
  const { activeBookId, goToPage } = useReaderStore()
  const { bookmarks, remove } = useBookmarks(activeBookId)

  if (bookmarks.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 p-6 text-center" style={{ color: 'var(--color-text-muted)' }}>
        <Bookmark size={32} strokeWidth={1} />
        <p className="text-sm">No bookmarks yet.<br />Press the bookmark icon while reading.</p>
      </div>
    )
  }

  return (
    <ul className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
      {bookmarks.map((bm) => (
        <li
          key={bm.id}
          className="group flex items-center gap-2 px-3 py-2.5 hover:bg-white/5 cursor-pointer"
          onClick={() => goToPage(bm.pageNumber)}
        >
          <Bookmark size={14} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />
          <div className="flex-1 min-w-0">
            <span className="text-sm" style={{ color: 'var(--color-text)' }}>
              Page {bm.pageNumber}
            </span>
            {bm.note && (
              <p className="text-xs truncate mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                {bm.note}
              </p>
            )}
          </div>
          <button
            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 transition-all"
            onClick={(e) => { e.stopPropagation(); if (bm.id != null) remove(bm.id) }}
            aria-label="Delete bookmark"
          >
            <Trash2 size={12} style={{ color: '#ef4444' }} />
          </button>
        </li>
      ))}
    </ul>
  )
}
