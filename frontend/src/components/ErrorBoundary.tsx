import React from 'react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.setState({ error, errorInfo })
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback
      return <FallbackComponent error={this.state.error} resetError={this.resetError} />
    }

    return this.props.children
  }
}

// Default error fallback component
const DefaultErrorFallback: React.FC<{ error?: Error; resetError: () => void }> = ({
  error,
  resetError
}) => {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-8">
      <div className="text-center bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
        <div className="mb-4">
          <svg
            className="mx-auto h-12 w-12 text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h3 className="text-sm font-medium text-red-800 mb-2">
          Bir Hata Oluştu
        </h3>
        <div className="text-sm text-red-700 mb-4">
          <p className="mb-2">
            {error?.message || 'Beklenmeyen bir hata oluştu.'}
          </p>
          {process.env.NODE_ENV === 'development' && error && (
            <details className="text-left bg-red-100 p-2 rounded text-xs">
              <summary className="cursor-pointer font-medium">Teknik Detaylar</summary>
              <pre className="mt-2 whitespace-pre-wrap break-all">
                {error.stack}
              </pre>
            </details>
          )}
        </div>
        <button
          onClick={resetError}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
        >
          Tekrar Dene
        </button>
      </div>
    </div>
  )
}

export default ErrorBoundary
