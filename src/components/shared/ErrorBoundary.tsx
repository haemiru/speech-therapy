'use client';

import { Component, type ReactNode } from 'react';
import { Button } from '@/components/ui/Button';

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

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="text-6xl mb-4">😢</div>
          <h2 className="text-xl font-bold text-gray-700 mb-2">
            앗, 문제가 생겼어!
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            걱정 마세요! 다시 시도해 볼까요?
          </p>
          <Button onClick={() => window.location.reload()}>
            🔄 다시 시도
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
