import React, { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ControlsPanel } from './ControlsPanel';
import { SceneManager } from './SceneManager';
import { 
  Settings2, 
  Save, 
  Share2, 
  Download, 
  ChevronUp,
  Palette,
  Sliders
} from 'lucide-react';

export function MobileBottomNav() {
  const isMobile = useIsMobile();
  const [activeSheet, setActiveSheet] = useState<'controls' | 'scene' | null>(null);

  if (!isMobile) {
    return null;
  }

  return (
    <>
      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-sm border-t border-border">
        <div className="flex items-center justify-around px-4 py-3 safe-area-bottom">
          {/* Controls Sheet */}
          <Sheet open={activeSheet === 'controls'} onOpenChange={(open) => setActiveSheet(open ? 'controls' : null)}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="flex-col gap-1 h-auto py-2">
                <Sliders className="w-5 h-5" />
                <span className="text-xs">Adjust</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh] overflow-y-auto">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Sliders className="w-5 h-5" />
                  Adjust Design
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <ControlsPanel />
              </div>
            </SheetContent>
          </Sheet>

          {/* Scene Manager Sheet */}
          <Sheet open={activeSheet === 'scene'} onOpenChange={(open) => setActiveSheet(open ? 'scene' : null)}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="flex-col gap-1 h-auto py-2">
                <Save className="w-5 h-5" />
                <span className="text-xs">Save</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh] overflow-y-auto">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Save className="w-5 h-5" />
                  Save & Share
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <SceneManager />
              </div>
            </SheetContent>
          </Sheet>

          {/* Quick Actions */}
          <Button variant="ghost" size="sm" className="flex-col gap-1 h-auto py-2">
            <Share2 className="w-5 h-5" />
            <span className="text-xs">Share</span>
          </Button>

          <Button variant="ghost" size="sm" className="flex-col gap-1 h-auto py-2">
            <Download className="w-5 h-5" />
            <span className="text-xs">Export</span>
          </Button>
        </div>
      </div>

      {/* Bottom padding for content */}
      <div className="h-20" />
    </>
  );
}