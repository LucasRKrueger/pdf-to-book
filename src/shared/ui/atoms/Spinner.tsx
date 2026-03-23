interface Props {
  size?: number
  label?: string
}

export function Spinner({ size = 40, label = 'Loading…' }: Props) {
  return (
    <div className="flex flex-col items-center gap-3" style={{ color: 'var(--color-text-muted)' }}>
      <div
        className="rounded-full border-[3px] animate-spin"
        style={{
          width: size,
          height: size,
          borderColor: 'var(--color-border)',
          borderTopColor: 'var(--color-accent)',
        }}
        role="status"
        aria-label={label}
      />
      <p className="text-sm">{label}</p>
    </div>
  )
}
