import { useRef, useCallback } from 'react'

const SWIPE_THRESHOLD = 50
const SWIPE_RATIO = 1.5
const TAP_MAX_MOVE = 10

interface GestureConfig {
  onSwipeLeft: () => void
  onSwipeRight: () => void
  /** relX: 0–1, position relative to the element width */
  onTap: (relX: number) => void
  /** ratio: currentDistance / startDistance (>1 = pinch out/zoom in) */
  onPinchMove: (ratio: number) => void
  /** Called when all fingers lift after a pinch */
  onPinchEnd: (finalRatio: number) => void
}

export function useGestures(config: GestureConfig) {
  const configRef = useRef(config)
  configRef.current = config

  // Map of active pointer IDs → current position
  const pointers = useRef<Map<number, { x: number; y: number }>>(new Map())

  // Swipe tracking (single finger)
  const swipeStart = useRef<{ x: number; y: number } | null>(null)

  // Pinch tracking
  const pinchStartDist = useRef<number | null>(null)
  const isPinching = useRef(false)

  function getPinchDist() {
    const pts = [...pointers.current.values()]
    if (pts.length < 2) return null
    return Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y)
  }

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (e.pointerType === 'mouse') return
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })

    if (pointers.current.size === 1) {
      // Potential swipe or tap
      swipeStart.current = { x: e.clientX, y: e.clientY }
      isPinching.current = false
    } else if (pointers.current.size === 2) {
      // Cancel swipe, begin pinch
      swipeStart.current = null
      isPinching.current = true
      const dist = getPinchDist()
      if (dist !== null) pinchStartDist.current = dist
    }
  }, [])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })

    if (isPinching.current && pointers.current.size >= 2 && pinchStartDist.current) {
      const dist = getPinchDist()
      if (dist !== null) {
        configRef.current.onPinchMove(dist / pinchStartDist.current)
      }
    }
  }, [])

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    if (e.pointerType === 'mouse') return

    // Update final position before deciding
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })

    if (isPinching.current) {
      const dist = getPinchDist()
      if (dist !== null && pinchStartDist.current) {
        configRef.current.onPinchEnd(dist / pinchStartDist.current)
      }
      pointers.current.delete(e.pointerId)
      if (pointers.current.size < 2) {
        isPinching.current = false
        pinchStartDist.current = null
      }
      return
    }

    // Single-finger: check swipe or tap
    if (swipeStart.current && pointers.current.size === 1) {
      const dx = e.clientX - swipeStart.current.x
      const dy = e.clientY - swipeStart.current.y

      if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy) * SWIPE_RATIO) {
        // Swipe
        if (dx < 0) configRef.current.onSwipeLeft()
        else configRef.current.onSwipeRight()
      } else if (Math.abs(dx) < TAP_MAX_MOVE && Math.abs(dy) < TAP_MAX_MOVE) {
        // Tap
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
        const relX = (e.clientX - rect.left) / rect.width
        configRef.current.onTap(relX)
      }

      swipeStart.current = null
    }

    pointers.current.delete(e.pointerId)
  }, [])

  const onPointerCancel = useCallback((e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId)
    if (pointers.current.size === 0) {
      swipeStart.current = null
      isPinching.current = false
      pinchStartDist.current = null
    }
  }, [])

  return { onPointerDown, onPointerMove, onPointerUp, onPointerCancel }
}
