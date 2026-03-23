interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
  active?: boolean
  activeColor?: string
}

export function IconButton({ label, active, activeColor, children, className = '', ...rest }: Props) {
  return (
    <button
      aria-label={label}
      title={label}
      className={`p-2 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0 disabled:opacity-30 ${className}`}
      style={{ color: active && activeColor ? activeColor : 'var(--color-text-muted)' }}
      {...rest}
    >
      {children}
    </button>
  )
}
