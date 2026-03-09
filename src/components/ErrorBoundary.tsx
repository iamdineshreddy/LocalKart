import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-white rounded-[2rem] p-8 text-center shadow-2xl border border-slate-100">
                        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="h-10 w-10 text-red-500" />
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 mb-2">Oops! Something went wrong</h1>
                        <p className="text-slate-500 font-medium mb-8">
                            We're sorry, but an unexpected error occurred. Our team has been notified.
                        </p>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => window.location.reload()}
                                className="w-full bg-blue-600 text-white py-4 rounded-xl font-black text-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                            >
                                <RefreshCw className="h-5 w-5" /> Try Again
                            </button>
                            <button
                                onClick={() => {
                                    this.setState({ hasError: false, error: null });
                                    window.location.href = '/';
                                }}
                                className="w-full bg-slate-100 text-slate-600 py-4 rounded-xl font-bold text-lg hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                            >
                                <Home className="h-5 w-5" /> Go Home
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
