import { useEffect } from 'react'
import { useReaderStore } from '@/shared/model/readerStore'

export function useKeyboardNavigation() {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      const { goToPage, currentPage, totalPages } = useReaderStore.getState()
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'j' || e.key === ' ') {
        e.preventDefault()
        goToPage(currentPage + 1)
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault()
        goToPage(currentPage - 1)
      } else if (e.key === 'Home') {
        goToPage(1)
      } else if (e.key === 'End') {
        goToPage(totalPages)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])
}
