import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-red-50 to-orange-50 p-6">
          <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-xl">
            {/* Error Icon */}
            <div className="mb-6 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br from-red-500 to-orange-500 shadow-lg">
                <AlertTriangle className="h-10 w-10 text-white" />
              </div>
            </div>

            {/* Error Title */}
            <h2 className="mb-3 text-center text-2xl font-semibold text-slate-800">
              Something went wrong!
            </h2>

            {/* Error Description */}
            <p className="mb-6 text-center leading-relaxed text-slate-600">
              An unexpected error occurred. Don't worry, our team has been
              notified.
            </p>

            {/* Error Details (in development) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
                <h3 className="mb-2 font-semibold text-red-800">
                  Error Details:
                </h3>
                <pre className="max-h-32 overflow-auto text-sm text-red-700">
                  {this.state.error.message}
                </pre>
                {this.state.errorInfo && (
                  <details className="mt-2">
                    <summary className="cursor-pointer font-medium text-red-800">
                      Stack Trace
                    </summary>
                    <pre className="mt-2 max-h-32 overflow-auto text-xs text-red-600">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="flex-1 transition-colors duration-200 hover:border-red-300 hover:bg-red-50"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Reload Page
              </Button>

              <Button
                onClick={() => (window.location.href = '/')}
                className="flex-1 bg-linear-to-r from-blue-600 to-purple-600 shadow-lg transition-all duration-200 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl"
              >
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </Button>
            </div>

            {/* Help Text */}
            <p className="mt-6 text-center text-sm text-slate-500">
              If this problem persists, please contact our support team.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
