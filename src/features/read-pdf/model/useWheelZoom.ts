import { useEffect } from 'react'
import { useReaderStore } from '@/shared/model/readerStore'

/**
 * Ctrl/Cmd + scroll wheel → zoom in/out on desktop.
 * Prevents the browser's own page-zoom from firing.
 */
export function useWheelZoom(viewportRef: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = viewportRef.current
    if (!el) return

    function handleWheel(e: WheelEvent) {
      if (!e.ctrlKey && !e.metaKey) return
      e.preventDefault()
      const { scale, setScale } = useReaderStore.getState()
      const delta = e.deltaY > 0 ? -0.12 : 0.12
      setScale(Math.max(0.25, Math.min(4, scale + delta)))
    }

    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, [viewportRef])
}
