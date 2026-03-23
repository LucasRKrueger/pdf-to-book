import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { IconButton } from '@/shared/ui/atoms/IconButton'

interface Props {
  currentPage: number
  totalPages: number
  onGoToPage: (page: number) => void
}

export function PageCounter({ currentPage, totalPages, onGoToPage }: Props) {
  const [editing, setEditing] = useState(false)
  const [inputValue, setInputValue] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const num = parseInt(inputValue, 10)
    if (!isNaN(num)) onGoToPage(num)
    setEditing(false)
    setInputValue('')
  }

  return (
    <div className="flex items-center gap-1">
      <IconButton
        label="Previous page"
        onClick={() => onGoToPage(currentPage - 1)}
        disabled={currentPage <= 1}
      >
        <ChevronLeft size={18} />
      </IconButton>

      {editing ? (
        <form onSubmit={handleSubmit}>
          <input
            autoFocus
            type="number"
            min={1}
            max={totalPages}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onBlur={() => { setEditing(false); setInputValue('') }}
            className="w-14 text-center rounded px-1 py-0.5 text-sm"
            style={{
              background: 'var(--color-surface-2)',
              border: '1px solid var(--color-accent)',
              color: 'var(--color-text)',
              outline: 'none',
            }}
          />
        </form>
      ) : (
        <button
          onClick={() => { setInputValue(String(currentPage)); setEditing(true) }}
          className="px-2 py-0.5 rounded hover:bg-white/10 transition-colors text-sm tabular-nums"
          style={{ color: 'var(--color-text-muted)' }}
          title="Click to jump to page"
        >
          {currentPage} / {totalPages}
        </button>
      )}

      <IconButton
        label="Next page"
        onClick={() => onGoToPage(currentPage + 1)}
        disabled={currentPage >= totalPages}
      >
        <ChevronRight size={18} />
      </IconButton>
    </div>
  )
}
