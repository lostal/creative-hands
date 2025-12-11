/**
 * ErrorBoundary - Catches React errors gracefully
 */

import { Component } from 'react';
import { Link } from 'react-router-dom';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-background p-4">
                    <div className="text-center max-w-md">
                        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-error-muted flex items-center justify-center">
                            <svg className="w-8 h-8 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                            </svg>
                        </div>
                        <h1 className="font-brand text-2xl text-foreground mb-4">
                            Algo salió mal
                        </h1>
                        <p className="text-foreground-secondary mb-6">
                            Ha ocurrido un error inesperado. Por favor, intenta recargar la página.
                        </p>
                        <div className="flex flex-col gap-2">
                            <button
                                onClick={() => window.location.reload()}
                                className="btn btn-primary"
                            >
                                Recargar página
                            </button>
                            <Link to="/" className="btn btn-ghost">
                                Volver al inicio
                            </Link>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
