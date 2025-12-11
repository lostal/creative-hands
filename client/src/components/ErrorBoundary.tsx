import React from "react";
import logger from "../utils/logger";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  info: React.ErrorInfo | null;
}

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    this.setState({ error, info });
    // Registrar usando logger estructurado
    logger.error("ErrorBoundary caught an error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="max-w-3xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Se ha producido un error
            </h2>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
              La aplicación encontró un error al renderizar esta página. Mira la
              consola para más detalles.
            </p>
            <details className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap max-h-48 overflow-auto p-2 bg-gray-50 dark:bg-gray-900 rounded">
              {String(this.state.error)}
              {this.state.info && this.state.info.componentStack
                ? "\n\n" + this.state.info.componentStack
                : ""}
            </details>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-primary-500 text-white rounded"
              >
                Recargar
              </button>
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null, info: null });
                }}
                className="px-4 py-2 glass rounded"
              >
                Intentar ignorar
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
