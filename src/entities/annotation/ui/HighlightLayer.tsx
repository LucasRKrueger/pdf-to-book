import type { PDFPageProxy } from 'pdfjs-dist'
import type { Annotation } from '@/shared/types/annotation'
import { HIGHLIGHT_COLORS } from '@/shared/types/annotation'
import { useUiStore } from '@/shared/model/uiStore'

interface Props {
  page: PDFPageProxy | null
  scale: number
  annotations: Annotation[]
  onAnnotationClick?: (annotation: Annotation, e: React.MouseEvent) => void
}

export function HighlightLayer({ page, scale, annotations, onAnnotationClick }: Props) {
  const setActive = useUiStore((s) => s.setActiveAnnotation)

  if (!page || annotations.length === 0) return null

  const viewport = page.getViewport({ scale })
  const w = viewport.width
  const h = viewport.height

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      style={{ width: w, height: h }}
      viewBox={`0 0 ${w} ${h}`}
    >
      {annotations.map((ann) =>
        ann.rects.map((rect, ri) => {
          const x = rect.x * w
          const y = rect.y * h
          const rw = rect.width * w
          const rh = rect.height * h
          const color = HIGHLIGHT_COLORS[ann.color]

          if (ann.type === 'underline') {
            return (
              <line
                key={`${ann.id}-${ri}`}
                x1={x} y1={y + rh}
                x2={x + rw} y2={y + rh}
                stroke={color.replace('0.35', '0.9')}
                strokeWidth={2}
                className="pointer-events-auto cursor-pointer"
                onClick={(e) => {
                  if (ann.id != null) setActive(ann.id)
                  onAnnotationClick?.(ann, e)
                }}
              />
            )
          }

          return (
            <rect
              key={`${ann.id}-${ri}`}
              x={x} y={y}
              width={rw} height={rh}
              fill={color}
              className="pointer-events-auto cursor-pointer"
              onClick={(e) => {
                if (ann.id != null) setActive(ann.id)
                onAnnotationClick?.(ann, e)
              }}
            />
          )
        })
      )}
    </svg>
  )
}
