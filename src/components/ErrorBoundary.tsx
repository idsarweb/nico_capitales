import React, { Component, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '../i18n';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  translatorReady: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, translatorReady: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, translatorReady: false };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <ErrorFallback
          error={this.state.error}
          onTranslatorReady={() => this.setState({ translatorReady: true })}
        />
      );
    }

    return this.props.children;
  }
}

function ErrorFallback({
  error,
  onTranslatorReady,
}: {
  error: Error | null;
  onTranslatorReady: () => void;
}) {
  let t: (key: string) => string;
  try {
    const { t: tHook } = useTranslation();
    onTranslatorReady();
    t = tHook;
  } catch {
    // LanguageProvider not reachable — show English fallback
    t = (key: string) => key;
  }

  const fallbackText: Record<string, string> = {
    'general.somethingWrong': 'Something went wrong',
    'general.error': 'An unexpected error occurred.',
    'general.reload': 'Reload Page',
  };

  const title = fallbackText['general.somethingWrong'] === 'Something went wrong' ? t('general.somethingWrong') : fallbackText['general.somethingWrong'];
  const description = error?.message ?? (fallbackText['general.error'] === 'An unexpected error occurred.' ? t('general.error') : fallbackText['general.error']);
  const reload = fallbackText['general.reload'] === 'Reload Page' ? t('general.reload') : fallbackText['general.reload'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex h-full flex-col items-center justify-center gap-4 px-4 text-center"
    >
      <div className="text-5xl">🗺️💥</div>
      <h2 className="text-xl font-bold text-white">{title}</h2>
      <p className="max-w-xs text-sm text-slate-400">{description}</p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 px-5 py-2 text-sm font-bold text-white shadow-lg transition hover:shadow-xl"
      >
        {reload}
      </button>
    </motion.div>
  );
}
