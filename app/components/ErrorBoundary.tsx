"use client";

import React from "react";

type ErrorBoundaryProps = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
};

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-6 py-16 text-center">
          <span className="grid size-16 place-items-center rounded-2xl border border-white/20 bg-[#df795f] text-2xl text-white">
            ✕
          </span>
          <h2 className="mt-6 text-2xl font-semibold text-[var(--text-primary)]">
            Something went wrong
          </h2>
          <p className="mt-3 text-base leading-relaxed text-[var(--text-secondary)]">
            An unexpected error occurred in this component. Please try again.
          </p>
          {this.state.error && (
            <pre className="mt-4 max-w-full overflow-auto rounded-xl bg-[var(--bg-card)] border border-[var(--border)] p-4 text-left text-xs text-[var(--text-secondary)]">
              {this.state.error.message}
            </pre>
          )}
          <button
            className="mt-6 rounded-xl border border-[var(--accent)] bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:border-[var(--accent-hover)] hover:bg-[var(--accent-hover)]"
            onClick={this.handleReset}
            type="button"
          >
            Try Again ↻
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
