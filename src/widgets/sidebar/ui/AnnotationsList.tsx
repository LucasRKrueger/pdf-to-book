import { MessageSquare, Trash2 } from 'lucide-react'
import { useReaderStore } from '@/shared/model/readerStore'
import { useUiStore } from '@/shared/model/uiStore'
import { HIGHLIGHT_COLORS } from '@/shared/types/annotation'
import { useAllAnnotations } from '@/widgets/sidebar/model/useAllAnnotations'

export function AnnotationsList() {
  const { activeBookId, goToPage } = useReaderStore()
  const setActive = useUiStore((s) => s.setActiveAnnotation)
  const { annotations, remove } = useAllAnnotations(activeBookId)

  if (annotations.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 p-6 text-center" style={{ color: 'var(--color-text-muted)' }}>
        <MessageSquare size={32} strokeWidth={1} />
        <p className="text-sm">No highlights yet.<br />Select text while reading to highlight it.</p>
      </div>
    )
  }

  return (
    <ul className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
      {annotations.map((ann) => (
        <li
          key={ann.id}
          className="group px-3 py-2.5 hover:bg-white/5 cursor-pointer"
          onClick={() => { goToPage(ann.pageNumber); if (ann.id) setActive(ann.id) }}
        >
          <div className="flex items-start gap-2">
            <div
              className="mt-1 w-3 h-3 rounded-sm flex-shrink-0"
              style={{ background: HIGHLIGHT_COLORS[ann.color].replace('0.35', '0.85') }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs line-clamp-2" style={{ color: 'var(--color-text)' }}>
                {ann.selectedText}
              </p>
              <span className="text-xs mt-0.5 block" style={{ color: 'var(--color-text-muted)' }}>
                Page {ann.pageNumber}
              </span>
              {ann.note && (
                <p className="text-xs italic mt-1" style={{ color: 'var(--color-text-muted)' }}>
                  {ann.note}
                </p>
              )}
            </div>
            <button
              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 transition-all flex-shrink-0"
              onClick={(e) => { e.stopPropagation(); if (ann.id != null) remove(ann.id) }}
              aria-label="Delete annotation"
            >
              <Trash2 size={12} style={{ color: '#ef4444' }} />
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}
