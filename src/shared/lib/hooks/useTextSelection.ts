import { useState, useEffect, useCallback } from 'react'

export interface SelectionBox {
  x: number
  y: number
  width: number
}

export function useTextSelection(containerRef: React.RefObject<HTMLElement | null>) {
  const [hasSelection, setHasSelection] = useState(false)
  const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null)

  const updateSelection = useCallback(() => {
    const sel = window.getSelection()
    if (!sel || sel.isCollapsed || !containerRef.current) {
      setHasSelection(false)
      setSelectionBox(null)
      return
    }

    const range = sel.getRangeAt(0)
    if (!containerRef.current.contains(range.commonAncestorContainer)) {
      setHasSelection(false)
      setSelectionBox(null)
      return
    }

    setHasSelection(true)

    const rects = Array.from(range.getClientRects())
    if (rects.length === 0) return

    const containerRect = containerRef.current.getBoundingClientRect()
    const firstRect = rects[0]
    setSelectionBox({
      x: firstRect.left + firstRect.width / 2 - containerRect.left,
      y: firstRect.top - containerRect.top,
      width: firstRect.width,
    })
  }, [containerRef])

  useEffect(() => {
    document.addEventListener('selectionchange', updateSelection)
    return () => document.removeEventListener('selectionchange', updateSelection)
  }, [updateSelection])

  const clearSelection = useCallback(() => {
    window.getSelection()?.removeAllRanges()
    setHasSelection(false)
    setSelectionBox(null)
  }, [])

  return { hasSelection, selectionBox, clearSelection }
}
