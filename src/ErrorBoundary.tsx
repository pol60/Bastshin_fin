// src/ErrorBoundary.tsx
import React from 'react';
import { logError } from './lib/analytics';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    logError(error, 'ErrorBoundary', { 
      componentStack: errorInfo.componentStack,
      location: typeof window !== 'undefined' ? window.location.pathname : 'server'
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Упс! Щось пішло не так
          </h1>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={() => typeof window !== 'undefined' && window.location.reload()}
          >
            Спробувати знову
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}