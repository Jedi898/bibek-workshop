'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children?: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="p-6 bg-red-900/20 border border-red-700 rounded-lg text-red-200 my-4">
          <h2 className="text-lg font-bold mb-2 text-red-400">Something went wrong</h2>
          <p className="text-sm mb-4 text-gray-300">The application encountered an error in this section.</p>
          <details className="text-xs bg-black/30 p-3 rounded overflow-auto max-h-40 border border-red-900/50 mb-4">
            <summary className="cursor-pointer font-semibold mb-1 text-red-300">Error Details</summary>
            <pre className="whitespace-pre-wrap font-mono text-red-200/70">
              {this.state.error && this.state.error.toString()}
            </pre>
          </details>
          <button
            className="px-4 py-2 bg-red-700 hover:bg-red-600 text-white rounded text-sm transition-colors shadow-lg"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary