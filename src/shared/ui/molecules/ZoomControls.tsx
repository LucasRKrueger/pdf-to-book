import { useState } from 'react'
import { Maximize2, ZoomIn, ZoomOut } from 'lucide-react'
import { IconButton } from '@/shared/ui/atoms/IconButton'

interface Props {
  scale: number
  onZoomIn: () => void
  onZoomOut: () => void
  onFitWidth: () => void
}

export function ZoomControls({ scale, onZoomIn, onZoomOut, onFitWidth }: Props) {
  const [showPercent, setShowPercent] = useState(false)

  return (
    <div className="flex items-center gap-0.5">
      <div className="w-px h-4 mx-1" style={{ background: 'var(--color-border)' }} />
      <IconButton label="Fit to width" onClick={onFitWidth}>
        <Maximize2 size={14} />
      </IconButton>
      <IconButton label="Zoom out" onClick={() => { onZoomOut(); setShowPercent(true) }}>
        <ZoomOut size={15} />
      </IconButton>
      {showPercent && (
        <span className="text-xs tabular-nums w-9 text-center" style={{ color: 'var(--color-text-muted)' }}>
          {Math.round(scale * 100)}%
        </span>
      )}
      <IconButton label="Zoom in" onClick={() => { onZoomIn(); setShowPercent(true) }}>
        <ZoomIn size={15} />
      </IconButton>
    </div>
  )
}
