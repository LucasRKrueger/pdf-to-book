interface Props {
  value: number
  max: number
  height?: number
}

export function ProgressBar({ value, max, height = 4 }: Props) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0
  return (
    <div
      className="w-full rounded-full overflow-hidden"
      style={{ height, background: 'var(--color-surface-2)' }}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      <div
        className="h-full rounded-full transition-all duration-300"
        style={{ width: `${pct}%`, background: 'var(--color-accent)' }}
      />
    </div>
  )
}
