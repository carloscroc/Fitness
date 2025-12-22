import React from 'react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error | null
}

export class ErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  constructor(props: React.PropsWithChildren) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('Uncaught error in React tree:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-black text-white p-8">
          <div className="max-w-xl text-center">
            <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
            <p className="text-sm mb-6 text-zinc-300">
              An unexpected error occurred while rendering the application. Try refreshing, or check the console for details.
            </p>
            <div className="flex gap-2 justify-center mb-4">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Refresh
              </button>
            </div>
            <details className="text-left bg-[#0d0d0f] p-4 rounded-md border border-white/5 text-zinc-300">
              <summary className="cursor-pointer font-medium">Show error details</summary>
              <div className="mt-2 text-xs leading-relaxed break-words">
                <pre className="whitespace-pre-wrap text-[12px]">{String(this.state.error?.message || '')}</pre>
                {this.state.error?.stack && (
                  <pre className="mt-2 text-[11px] text-zinc-400 whitespace-pre-wrap">{this.state.error?.stack}</pre>
                )}
              </div>
            </details>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}