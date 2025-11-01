"use client";

import { Component, ReactNode } from "react";
import { AlertCircle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    
    // You can send error to monitoring service here
    // e.g., Sentry.captureException(error);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-6 rounded-3xl border border-error/20 bg-error/5 p-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-error/10">
            <AlertCircle className="h-8 w-8 text-error" />
          </div>
          <div className="max-w-md space-y-2 text-center">
            <h3 className="text-xl font-semibold text-neutral-900">
              出现了一些问题
            </h3>
            <p className="text-sm text-neutral-600">
              {this.state.error?.message || "应用遇到了意外错误，请尝试刷新页面。"}
            </p>
            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="mt-4 rounded-lg bg-neutral-100 p-4 text-left text-xs">
                <summary className="cursor-pointer font-medium">
                  错误详情（仅开发环境）
                </summary>
                <pre className="mt-2 overflow-auto text-xs">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => window.location.reload()}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              刷新页面
            </Button>
            <Button onClick={this.handleReset}>重试</Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

