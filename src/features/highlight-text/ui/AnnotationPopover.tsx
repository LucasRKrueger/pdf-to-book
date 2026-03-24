import { Trash2 } from 'lucide-react'

interface Props {
  x: number
  y: number
  containerWidth: number
  containerHeight: number
  onDelete: () => void
  onDismiss: () => void
}

const POPOVER_W = 110
const POPOVER_H = 36

export function AnnotationPopover({ x, y, containerWidth, containerHeight, onDelete, onDismiss }: Props) {
  const left = Math.max(4, Math.min(x - POPOVER_W / 2, containerWidth - POPOVER_W - 4))
  const top = Math.max(4, Math.min(y - POPOVER_H - 8, containerHeight - POPOVER_H - 4))

  return (
    <>
      {/* Backdrop — click outside closes */}
      <div className="absolute inset-0 z-40" onClick={onDismiss} />

      <div
        className="absolute z-50 flex items-center px-1.5 py-1.5 rounded-lg shadow-xl"
        style={{
          left,
          top,
          background: 'var(--color-surface-2)',
          border: '1px solid var(--color-border)',
        }}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => { onDelete(); onDismiss() }}
          className="flex items-center gap-1.5 px-2 py-1 text-sm rounded hover:bg-red-500/20 active:scale-95 transition-all"
          style={{ color: '#ef4444' }}
          aria-label="Remove highlight"
        >
          <Trash2 size={14} />
          <span>Remove</span>
        </button>
      </div>
    </>
  )
}
