import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle } from 'lucide-react';

interface SectionErrorBoundaryProps {
  children: React.ReactNode;
  sectionName?: string;
  minHeight?: string;
}

interface SectionErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

const IntersectionObserverWrapper: React.FC<{ children: React.ReactNode; minHeight?: string }> = ({ 
  children, 
  minHeight = "150px" 
}) => {
  const [hasRendered, setHasRendered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setHasRendered(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasRendered(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '300px 0px 400px 0px', // Generous pre-loading margin to make it transition completely seamlessly
        threshold: 0.01,
      }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  if (hasRendered) {
    return <>{children}</>;
  }

  return (
    <div 
      ref={ref} 
      style={{ minHeight }} 
      className="w-full opacity-0 pointer-events-none" 
    />
  );
};

export class SectionErrorBoundary extends React.Component<SectionErrorBoundaryProps, SectionErrorBoundaryState> {
  constructor(props: SectionErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): SectionErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`Error in section "${this.props.sectionName || 'Unknown'}":`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 rounded-[2rem] border border-red-500/20 bg-red-500/5 text-center my-4 overflow-hidden">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">Section Error</h3>
          <p className="text-sm opacity-60 mb-2">
            Something went wrong while rendering {this.props.sectionName || 'this part of the page'}.
          </p>
          {this.state.error && (
            <p className="text-xs font-mono text-red-400/80 mb-6 break-all px-4">{this.state.error.message}</p>
          )}
          <button 
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-6 py-2 bg-[#8B46FF] text-white font-bold rounded-xl text-[10px] uppercase tracking-widest hover:scale-105 transition-transform"
          >
            Retry Section
          </button>
        </div>
      );
    }

    return (
      <IntersectionObserverWrapper minHeight={this.props.minHeight}>
        {this.props.children}
      </IntersectionObserverWrapper>
    );
  }
}

