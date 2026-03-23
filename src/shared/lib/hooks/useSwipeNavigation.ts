import { useRef, useCallback } from 'react'

const SWIPE_THRESHOLD = 50
const SWIPE_RATIO = 1.5

export function useSwipeNavigation(onNext: () => void, onPrev: () => void) {
  const startXRef = useRef<number | null>(null)
  const startYRef = useRef<number | null>(null)

  const clearRefs = useCallback(() => {
    startXRef.current = null
    startYRef.current = null
  }, [])

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (e.pointerType === 'mouse') return
    startXRef.current = e.clientX
    startYRef.current = e.clientY
  }, [])

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    if (e.pointerType === 'mouse') return
    if (startXRef.current === null || startYRef.current === null) return

    const dx = e.clientX - startXRef.current
    const dy = e.clientY - startYRef.current

    if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy) * SWIPE_RATIO) {
      if (dx < 0) onNext()
      else onPrev()
    }

    clearRefs()
  }, [onNext, onPrev, clearRefs])

  // Prevents ghost navigation when touch is cancelled (notification, call, scroll takeover)
  const onPointerCancel = useCallback(() => { clearRefs() }, [clearRefs])

  return { onPointerDown, onPointerUp, onPointerCancel }
}
