import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useApp } from '@/store/AppContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { WindowCoordinates } from '@/types';
import { Crosshair, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Check } from 'lucide-react';

export function WindowSelector() {
  const { state, dispatch } = useApp();
  const [isDragging, setIsDragging] = useState<string | null>(null);
  const [localCoords, setLocalCoords] = useState<WindowCoordinates>({
    topLeft: { x: 0.2, y: 0.2 },
    topRight: { x: 0.8, y: 0.2 },
    bottomLeft: { x: 0.2, y: 0.8 },
    bottomRight: { x: 0.8, y: 0.8 },
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({ width: rect.width, height: rect.height });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const handleMouseDown = (corner: keyof WindowCoordinates) => {
    setIsDragging(corner);
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

    setLocalCoords(prev => ({
      ...prev,
      [isDragging]: { x, y }
    }));
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(null);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove as any);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove as any);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const nudgeCorner = (corner: keyof WindowCoordinates, direction: 'up' | 'down' | 'left' | 'right') => {
    const delta = 0.01;
    const current = localCoords[corner];
    let newX = current.x;
    let newY = current.y;

    switch (direction) {
      case 'up': newY = Math.max(0, current.y - delta); break;
      case 'down': newY = Math.min(1, current.y + delta); break;
      case 'left': newX = Math.max(0, current.x - delta); break;
      case 'right': newX = Math.min(1, current.x + delta); break;
    }

    setLocalCoords(prev => ({
      ...prev,
      [corner]: { x: newX, y: newY }
    }));
  };

  const autoDetect = () => {
    // Simple auto-detect algorithm - place rectangle in center area
    setLocalCoords({
      topLeft: { x: 0.25, y: 0.25 },
      topRight: { x: 0.75, y: 0.25 },
      bottomLeft: { x: 0.25, y: 0.75 },
      bottomRight: { x: 0.75, y: 0.75 },
    });
  };

  const confirmSelection = () => {
    dispatch({ type: 'SET_WINDOW_COORDS', payload: localCoords });
    dispatch({ type: 'SET_STEP', payload: 'catalog' });
  };

  if (!state.photo.url) return null;

  return (
    <div className="flex-1 bg-background p-4 lg:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Mark Your Window
          </h2>
          <p className="text-muted-foreground">
            Drag the four corners to match your window — use Auto-detect to try automatic placement
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Image Area */}
          <div className="lg:col-span-2">
            <Card className="card-premium p-4">
              <div
                ref={containerRef}
                className="relative aspect-video bg-muted rounded-lg overflow-hidden cursor-crosshair"
                onMouseMove={handleMouseMove}
              >
                <img
                  src={state.photo.url}
                  alt="Window photo"
                  className="w-full h-full object-contain"
                  draggable={false}
                />
                
                {/* Window Overlay */}
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  style={{ zIndex: 1 }}
                >
                  <polygon
                    points={`
                      ${localCoords.topLeft.x * containerSize.width},${localCoords.topLeft.y * containerSize.height}
                      ${localCoords.topRight.x * containerSize.width},${localCoords.topRight.y * containerSize.height}
                      ${localCoords.bottomRight.x * containerSize.width},${localCoords.bottomRight.y * containerSize.height}
                      ${localCoords.bottomLeft.x * containerSize.width},${localCoords.bottomLeft.y * containerSize.height}
                    `}
                    fill="rgba(59, 130, 246, 0.1)"
                    stroke="rgb(59, 130, 246)"
                    strokeWidth="2"
                    strokeDasharray="8,4"
                  />
                </svg>

                {/* Draggable Corner Handles */}
                {Object.entries(localCoords).map(([corner, pos]) => (
                  <div
                    key={corner}
                    className="draggable-handle"
                    style={{
                      position: 'absolute',
                      left: `${pos.x * 100}%`,
                      top: `${pos.y * 100}%`,
                      transform: 'translate(-50%, -50%)',
                      zIndex: 10,
                    }}
                    onMouseDown={() => handleMouseDown(corner as keyof WindowCoordinates)}
                  />
                ))}
              </div>
            </Card>
          </div>

          {/* Controls Panel */}
          <div className="space-y-4">
            <Card className="card-premium p-4">
              <h3 className="font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button
                  onClick={autoDetect}
                  variant="outline"
                  className="w-full gap-2"
                >
                  <Crosshair className="w-4 h-4" />
                  Auto-detect
                </Button>
                
                <Button
                  onClick={confirmSelection}
                  className="w-full btn-premium gap-2"
                >
                  <Check className="w-4 h-4" />
                  Confirm Window
                </Button>
              </div>
            </Card>

            <Card className="card-premium p-4">
              <h3 className="font-semibold mb-4">Fine Tuning</h3>
              
              {Object.entries(localCoords).map(([corner, pos]) => (
                <div key={corner} className="mb-4 p-3 bg-muted/50 rounded-lg">
                  <div className="text-sm font-medium mb-2 capitalize">
                    {corner.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div>
                      <label className="text-xs text-muted-foreground">X:</label>
                      <Input
                        type="number"
                        min="0"
                        max="1"
                        step="0.01"
                        value={pos.x.toFixed(2)}
                        onChange={(e) => {
                          const value = Math.max(0, Math.min(1, parseFloat(e.target.value) || 0));
                          setLocalCoords(prev => ({
                            ...prev,
                            [corner]: { ...pos, x: value }
                          }));
                        }}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Y:</label>
                      <Input
                        type="number"
                        min="0"
                        max="1"
                        step="0.01"
                        value={pos.y.toFixed(2)}
                        onChange={(e) => {
                          const value = Math.max(0, Math.min(1, parseFloat(e.target.value) || 0));
                          setLocalCoords(prev => ({
                            ...prev,
                            [corner]: { ...pos, y: value }
                          }));
                        }}
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => nudgeCorner(corner as keyof WindowCoordinates, 'up')}
                      className="h-7 w-7 p-0"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => nudgeCorner(corner as keyof WindowCoordinates, 'down')}
                      className="h-7 w-7 p-0"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => nudgeCorner(corner as keyof WindowCoordinates, 'left')}
                      className="h-7 w-7 p-0"
                    >
                      <ArrowLeft className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => nudgeCorner(corner as keyof WindowCoordinates, 'right')}
                      className="h-7 w-7 p-0"
                    >
                      <ArrowRight className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}