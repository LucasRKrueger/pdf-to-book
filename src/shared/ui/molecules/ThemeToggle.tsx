import { BookOpen, Sun, Moon } from 'lucide-react'
import { useUiStore, type Theme } from '@/shared/model/uiStore'

const THEMES: { id: Theme; icon: React.ReactNode; label: string }[] = [
  { id: 'dark', icon: <Moon size={14} />, label: 'Dark' },
  { id: 'sepia', icon: <BookOpen size={14} />, label: 'Sepia' },
  { id: 'light', icon: <Sun size={14} />, label: 'Light' },
]

export function ThemeToggle() {
  const { theme, setTheme } = useUiStore()

  return (
    <div className="flex items-center gap-0.5 p-1 rounded-lg" style={{ background: 'var(--color-surface-2)' }}>
      {THEMES.map((t) => (
        <button
          key={t.id}
          onClick={() => setTheme(t.id)}
          title={t.label}
          className="flex items-center gap-1 px-2 py-1.5 rounded-md text-xs transition-colors"
          style={{
            background: theme === t.id ? 'var(--color-accent)' : 'transparent',
            color: theme === t.id ? '#fff' : 'var(--color-text-muted)',
          }}
        >
          {t.icon}
          <span className="hidden sm:inline ml-0.5">{t.label}</span>
        </button>
      ))}
    </div>
  )
}
