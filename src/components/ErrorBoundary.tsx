import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Flame, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in HOT HAVEN:', error, errorInfo);
  }

  public handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-orange-500 flex items-center justify-center mb-6 shadow-xl shadow-orange-500/20">
            <Flame className="w-9 h-9 fill-white text-white" />
          </div>
          <h1 className="text-2xl font-black mb-2 text-white font-display">
            HOT<span className="text-orange-500">HAVEN</span>
          </h1>
          <p className="text-sm text-slate-400 max-w-md mb-6 leading-relaxed">
            Something temporarily interrupted page rendering. You can quickly reload or reset cached stream data below.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={this.handleReload}
              className="px-5 py-2.5 rounded-full bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reload Stream Portal</span>
            </button>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="px-5 py-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer border border-slate-700"
            >
              Clear Cache & Reset
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
