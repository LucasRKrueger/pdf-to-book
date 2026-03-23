import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import * as Tabs from '@radix-ui/react-tabs'
import { useUiStore, type SidebarTab } from '@/shared/model/uiStore'
import { BookmarksList } from './BookmarksList'
import { AnnotationsList } from './AnnotationsList'

const TABS: { id: SidebarTab; label: string }[] = [
  { id: 'bookmarks', label: 'Bookmarks' },
  { id: 'annotations', label: 'Highlights' },
]

export function Sidebar() {
  const { sidebarOpen, sidebarTab, setSidebarTab, toggleSidebar } = useUiStore()

  return (
    <AnimatePresence>
      {sidebarOpen && (
        <>
          {/* Mobile backdrop — tap outside to close */}
          <div
            className="fixed inset-0 z-10 sm:hidden"
            style={{ background: 'rgba(0,0,0,0.4)' }}
            onClick={toggleSidebar}
            aria-hidden="true"
          />

          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="flex flex-col w-full sm:w-72 border-l flex-shrink-0 overflow-hidden absolute sm:relative inset-0 sm:inset-auto z-20"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <Tabs.Root
              value={sidebarTab}
              onValueChange={(v) => setSidebarTab(v as SidebarTab)}
              className="flex flex-col flex-1 overflow-hidden"
            >
              {/* Header */}
              <div
                className="flex items-center justify-between px-3 h-12 border-b flex-shrink-0"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <Tabs.List className="flex gap-1" aria-label="Sidebar sections">
                  {TABS.map((tab) => (
                    <Tabs.Trigger
                      key={tab.id}
                      value={tab.id}
                      className="px-3 py-1.5 text-sm rounded-md transition-colors outline-none"
                      style={{
                        background: sidebarTab === tab.id ? 'var(--color-surface-2)' : 'transparent',
                        color: sidebarTab === tab.id ? 'var(--color-text)' : 'var(--color-text-muted)',
                      }}
                    >
                      {tab.label}
                    </Tabs.Trigger>
                  ))}
                </Tabs.List>
                <button
                  onClick={toggleSidebar}
                  className="p-2 rounded hover:bg-white/10 active:bg-white/20 transition-colors"
                  aria-label="Close sidebar"
                >
                  <X size={18} style={{ color: 'var(--color-text-muted)' }} />
                </button>
              </div>

              {/* Content */}
              <Tabs.Content value="bookmarks" className="flex-1 overflow-y-auto outline-none">
                <BookmarksList />
              </Tabs.Content>
              <Tabs.Content value="annotations" className="flex-1 overflow-y-auto outline-none">
                <AnnotationsList />
              </Tabs.Content>
            </Tabs.Root>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
