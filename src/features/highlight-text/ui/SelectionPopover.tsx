import type { PDFPageProxy } from 'pdfjs-dist'
import type { HighlightColor, AnnotationType, PdfRect } from '@/shared/types/annotation'
import { HIGHLIGHT_COLORS } from '@/shared/types/annotation'
import { captureSelection } from '@/features/highlight-text/lib/selectionHandler'
import type { SelectionBox } from '@/shared/lib/hooks/useTextSelection'

const COLORS: HighlightColor[] = ['yellow', 'green', 'pink', 'blue']
// 4×36px circles + 3×4px gaps + 1px separator + 8px margin + 48px underline btn + 16px px padding
const POPOVER_W = 228
const POPOVER_H = 52

interface Props {
  selectionBox: SelectionBox
  containerWidth: number
  page: PDFPageProxy
  scale: number
  textLayerEl: HTMLElement
  onHighlight: (color: HighlightColor, type: AnnotationType, text: string, rects: PdfRect[]) => void
  onDismiss: () => void
}

export function SelectionPopover({ selectionBox, containerWidth, page, scale, textLayerEl, onHighlight, onDismiss }: Props) {
  const rawLeft = selectionBox.x - POPOVER_W / 2
  const left = Math.max(4, Math.min(rawLeft, containerWidth - POPOVER_W - 4))
  const top = Math.max(4, selectionBox.y - POPOVER_H - 8)

  function handleHighlight(color: HighlightColor, type: AnnotationType) {
    const result = captureSelection(textLayerEl, page, scale)
    if (!result) return
    onHighlight(color, type, result.text, result.rects)
    onDismiss()
  }

  return (
    <div
      className="absolute z-50 flex items-center gap-1 px-2 py-2 rounded-lg shadow-xl"
      style={{
        left,
        top,
        background: 'var(--color-surface-2)',
        border: '1px solid var(--color-border)',
      }}
      onMouseDown={(e) => e.preventDefault()}
    >
      {COLORS.map((color) => (
        <button
          key={color}
          title={`Highlight ${color}`}
          className="w-9 h-9 rounded-full border-2 border-transparent hover:border-white active:scale-95 transition-all"
          style={{ background: HIGHLIGHT_COLORS[color].replace('0.35', '0.85') }}
          onClick={() => handleHighlight(color, 'highlight')}
        />
      ))}
      <div className="w-px h-6 mx-1" style={{ background: 'var(--color-border)' }} />
      <button
        title="Underline"
        className="px-3 py-2 text-sm rounded hover:bg-white/10 active:bg-white/20 transition-colors"
        style={{ color: 'var(--color-text)' }}
        onClick={() => handleHighlight('yellow', 'underline')}
      >
        <span className="underline">U</span>
      </button>
    </div>
  )
}
