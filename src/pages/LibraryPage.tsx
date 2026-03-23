import { useEffect } from 'react'
import { BookOpen } from 'lucide-react'
import { useLibraryStore, BookCard } from '@/entities/book'
import { UploadZone } from '@/features/upload-book'
import { ThemeToggle } from '@/shared/ui/molecules/ThemeToggle'

export function LibraryPage() {
  const { books, isLoading, loadLibrary, refresh } = useLibraryStore()

  useEffect(() => { loadLibrary() }, [loadLibrary])

  return (
    <div className="min-h-full flex flex-col" style={{ background: 'var(--color-bg)' }}>
      {/* Header */}
      <header
        className="flex items-center justify-between px-4 sm:px-6 py-3 border-b"
        style={{
          borderColor: 'var(--color-border)',
          background: 'var(--color-surface)',
          paddingTop: 'max(0.75rem, env(safe-area-inset-top))',
          paddingLeft: 'max(1rem, env(safe-area-inset-left))',
          paddingRight: 'max(1rem, env(safe-area-inset-right))',
        }}
      >
        <div className="flex items-center gap-2">
          <BookOpen size={20} style={{ color: 'var(--color-accent)' }} />
          <h1 className="text-base sm:text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
            My Library
          </h1>
        </div>
        <ThemeToggle />
      </header>

      <main className="flex-1 p-4 sm:p-6 max-w-7xl mx-auto w-full">
        <div className="mb-4 sm:mb-6">
          <UploadZone onBookAdded={refresh} />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl overflow-hidden animate-pulse"
                style={{ background: 'var(--color-surface)' }}
              >
                <div className="aspect-[2/3]" style={{ background: 'var(--color-surface-2)' }} />
                <div className="p-3 space-y-2">
                  <div className="h-4 rounded" style={{ background: 'var(--color-surface-2)' }} />
                  <div className="h-3 w-2/3 rounded" style={{ background: 'var(--color-surface-2)' }} />
                </div>
              </div>
            ))}
          </div>
        ) : books.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center gap-4 py-12 text-center"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <BookOpen size={56} strokeWidth={1} />
            <div>
              <p className="text-base font-medium" style={{ color: 'var(--color-text)' }}>Your library is empty</p>
              <p className="text-sm mt-1">Add your first PDF book using the area above.</p>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-xs mb-3" style={{ color: 'var(--color-text-muted)' }}>
              {books.length} book{books.length !== 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {books.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
