import { Component, type ReactNode } from 'react'
import { ArrowLeft, AlertCircle } from 'lucide-react'

interface Props {
  children: ReactNode
}
interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div
          className="h-full flex flex-col items-center justify-center gap-4 p-8 text-center"
          style={{ background: 'var(--color-bg)' }}
        >
          <AlertCircle size={40} style={{ color: 'var(--color-text-muted)' }} strokeWidth={1.5} />
          <div>
            <p className="text-base font-medium" style={{ color: 'var(--color-text)' }}>
              Something went wrong
            </p>
            <p className="text-sm mt-1 max-w-sm" style={{ color: 'var(--color-text-muted)' }}>
              {this.state.error.message || 'An unexpected error occurred.'}
            </p>
          </div>
          <a
            href="/"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
            style={{ background: 'var(--color-accent)', color: '#fff' }}
          >
            <ArrowLeft size={16} />
            Back to Library
          </a>
        </div>
      )
    }
    return this.props.children
  }
}
