import React from 'react';
import { useApp } from '@/store/AppContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { state, dispatch } = useApp();

  const handleBack = () => {
    const steps: Array<'landing' | 'photo' | 'window' | 'catalog' | 'preview'> = 
      ['landing', 'photo', 'window', 'catalog', 'preview'];
    const currentIndex = steps.indexOf(state.step);
    if (currentIndex > 0) {
      dispatch({ type: 'SET_STEP', payload: steps[currentIndex - 1] });
    }
  };

  const handleHome = () => {
    dispatch({ type: 'RESET_APP' });
  };

  const showBackButton = state.step !== 'landing';
  const showHomeButton = state.step !== 'landing';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 py-3 lg:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            {showBackButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            )}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-accent-gradient rounded-lg flex items-center justify-center">
                <span className="text-accent-foreground font-bold text-sm">L</span>
              </div>
              <h1 className="text-xl font-semibold text-foreground">
                Lovable
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {showHomeButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleHome}
                className="gap-2"
              >
                <Home className="w-4 h-4" />
                Home
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-muted/50 border-t border-border px-4 py-6 lg:px-6">
        <div className="max-w-7xl mx-auto text-center text-sm text-muted-foreground">
          <p>© 2024 Lovable. See your blinds in your home before buying.</p>
        </div>
      </footer>
    </div>
  );
}