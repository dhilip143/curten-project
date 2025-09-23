import React from 'react';
import { useApp } from '@/store/AppContext';
import { Button } from '@/components/ui/button';
import { PreviewCanvas } from './PreviewCanvas';
import { ControlsPanel } from './ControlsPanel';
import { SceneManager } from './SceneManager';
import { MobileBottomNav } from './MobileBottomNav';
import { useIsMobile } from '@/hooks/use-mobile';
import { ArrowLeft, Grid3X3 } from 'lucide-react';

export function PreviewAndEdit() {
  const { state, dispatch } = useApp();
  const isMobile = useIsMobile();

  const goBackToCatalog = () => {
    dispatch({ type: 'SET_STEP', payload: 'catalog' });
  };

  const handleCompareMode = () => {
    // Toggle between with/without blinds (mock implementation)
    dispatch({
      type: 'UPDATE_TRANSFORMS',
      payload: { opacity: state.transforms.opacity > 0 ? 0 : 0.9 }
    });
  };

  if (!state.photo.url || !state.windowCoords || !state.selectedProduct) {
    return (
      <div className="flex-1 bg-background p-4 lg:p-6">
        <div className="max-w-4xl mx-auto text-center py-16">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Preview Not Available
          </h2>
          <p className="text-muted-foreground mb-6">
            Please complete the previous steps to see your preview.
          </p>
          <Button onClick={() => dispatch({ type: 'SET_STEP', payload: 'photo' })}>
            Start Over
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 bg-background p-4 lg:p-6 pb-24 md:pb-6">
        <div className="max-w-7xl mx-auto">
          {/* Header - Mobile Optimized */}
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                Preview & Edit
              </h2>
              <p className="text-sm md:text-base text-muted-foreground">
                Fine-tune your design and see how it looks in your space
              </p>
            </div>
            
            {!isMobile && (
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={goBackToCatalog}
                  className="gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Choose Different
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleCompareMode}
                  className="gap-2"
                >
                  <Grid3X3 className="w-4 h-4" />
                  Compare
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Action Buttons */}
          {isMobile && (
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              <Button
                variant="outline"
                size="sm"
                onClick={goBackToCatalog}
                className="gap-2 shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
                Different
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleCompareMode}
                className="gap-2 shrink-0"
              >
                <Grid3X3 className="w-4 h-4" />
                Compare
              </Button>
            </div>
          )}

          <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'lg:grid-cols-3'}`}>
            {/* Main Preview Area */}
            <div className={`space-y-4 ${isMobile ? '' : 'lg:col-span-2'}`}>
              <PreviewCanvas className="aspect-video" />
              
              {/* Quick Info */}
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <h3 className="font-semibold text-foreground">
                    {state.selectedProduct.name}
                  </h3>
                  <p className="text-sm text-muted-foreground capitalize">
                    {state.selectedProduct.category} • {state.transforms.isOpen ? 'Open' : 'Closed'}
                  </p>
                </div>
                
                <div className="text-right">
                  {state.selectedProduct.price && (
                    <p className="text-lg font-bold text-accent">
                      ${state.selectedProduct.price}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Opacity: {Math.round(state.transforms.opacity * 100)}%
                  </p>
                </div>
              </div>
            </div>

            {/* Desktop Controls Sidebar */}
            {!isMobile && (
              <div className="space-y-6">
                <ControlsPanel />
                <SceneManager />
              </div>
            )}
          </div>

          {/* Tips - Hide on mobile to save space */}
          {!isMobile && (
            <div className="mt-8 p-4 bg-accent/5 border border-accent/20 rounded-lg">
              <h4 className="font-semibold text-accent mb-2">💡 Tips for Better Results</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Adjust opacity to see how light filtering affects your room</li>
                <li>• Use the open/closed toggle to preview different states</li>
                <li>• Fine-tune positioning for the most realistic appearance</li>
                <li>• Save your design to share with family or request quotes</li>
              </ul>
            </div>
          )}
        </div>
      </div>
      
      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </>
  );
}