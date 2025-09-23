import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useApp } from '@/store/AppContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { WindowCoordinates } from '@/types';
import { Crosshair, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Check, Loader2, Eye, Square, Maximize } from 'lucide-react';
import { detectWindows, DetectionResult } from '@/lib/windowDetection';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

export function WindowSelector() {
  const { state, dispatch } = useApp();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [isDragging, setIsDragging] = useState<string | null>(null);
  const [localCoords, setLocalCoords] = useState<WindowCoordinates>({
    topLeft: { x: 0.2, y: 0.2 },
    topRight: { x: 0.8, y: 0.2 },
    bottomLeft: { x: 0.2, y: 0.8 },
    bottomRight: { x: 0.8, y: 0.8 },
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionResults, setDetectionResults] = useState<DetectionResult[]>([]);
  const [showDetectionResults, setShowDetectionResults] = useState(false);

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

  const handleTouchStart = (corner: keyof WindowCoordinates, e: React.TouchEvent) => {
    e.preventDefault();
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

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging || !containerRef.current) return;

    e.preventDefault();
    const touch = e.touches[0];
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (touch.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (touch.clientY - rect.top) / rect.height));

    setLocalCoords(prev => ({
      ...prev,
      [isDragging]: { x, y }
    }));
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(null);
  }, []);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(null);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove as any);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove as any, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove as any);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove as any);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

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

  const autoDetect = async () => {
    if (!state.photo.url || !state.photo.originalDimensions) {
      toast({
        title: "No Image",
        description: "Please capture or upload a photo first.",
        variant: "destructive"
      });
      return;
    }

    setIsDetecting(true);
    setShowDetectionResults(false);
    
    try {
      const results = await detectWindows(state.photo.url, state.photo.originalDimensions);
      
      if (results.length === 0) {
        toast({
          title: "No Windows Detected",
          description: "Could not automatically detect rectangular windows. Please mark manually.",
          variant: "destructive"
        });
        return;
      }

      setDetectionResults(results);
      setShowDetectionResults(true);
      
      // Auto-select the highest confidence result
      const bestResult = results[0];
      setLocalCoords(bestResult.coordinates);
      
      toast({
        title: "Window Detected!",
        description: `Found ${results.length} potential window${results.length > 1 ? 's' : ''}. ${bestResult.shape === 'square' ? 'Square' : 'Rectangular'} shape detected with ${Math.round(bestResult.confidence * 100)}% confidence.`,
      });
      
      // Log detection results for debugging
      console.log('Detection results:', results.map(r => ({
        shape: r.shape,
        confidence: Math.round(r.confidence * 100) + '%',
        area: Math.round((r.coordinates.bottomRight.x - r.coordinates.topLeft.x) * (r.coordinates.bottomRight.y - r.coordinates.topLeft.y) * 100) + '% of image'
      })));
      
    } catch (error) {
      console.error('Auto-detection failed:', error);
      toast({
        title: "Detection Failed",
        description: "Auto-detection encountered an error. Please mark the window manually.",
        variant: "destructive"
      });
    } finally {
      setIsDetecting(false);
    }
  };

  const selectDetectionResult = (result: DetectionResult) => {
    setLocalCoords(result.coordinates);
    setShowDetectionResults(false);
    
    toast({
      title: "Window Selected",
      description: `${result.shape === 'square' ? 'Square' : 'Rectangular'} window selected with ${Math.round(result.confidence * 100)}% confidence.`,
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
                className="relative bg-muted rounded-lg overflow-auto cursor-crosshair flex justify-center items-center min-h-[400px]"
                onMouseMove={handleMouseMove}
              >
                <img
                  src={state.photo.url}
                  alt="Window photo"
                  className="max-w-full max-h-full object-contain"
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
                  
                  {/* Show detection results as alternative overlays */}
                  {showDetectionResults && detectionResults.map((result, index) => {
                    const isSelected = JSON.stringify(result.coordinates) === JSON.stringify(localCoords);
                    if (isSelected) return null; // Don't show selected result twice
                    
                    return (
                      <polygon
                        key={index}
                        points={`
                          ${result.coordinates.topLeft.x * containerSize.width},${result.coordinates.topLeft.y * containerSize.height}
                          ${result.coordinates.topRight.x * containerSize.width},${result.coordinates.topRight.y * containerSize.height}
                          ${result.coordinates.bottomRight.x * containerSize.width},${result.coordinates.bottomRight.y * containerSize.height}
                          ${result.coordinates.bottomLeft.x * containerSize.width},${result.coordinates.bottomLeft.y * containerSize.height}
                        `}
                        fill="rgba(34, 197, 94, 0.05)"
                        stroke="rgb(34, 197, 94)"
                        strokeWidth="1"
                        strokeDasharray="4,4"
                        className="cursor-pointer"
                        onClick={() => selectDetectionResult(result)}
                      />
                    );
                  })}
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
                    onTouchStart={(e) => handleTouchStart(corner as keyof WindowCoordinates, e)}
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
                  disabled={isDetecting}
                >
                  {isDetecting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Crosshair className="w-4 h-4" />
                  )}
                  {isDetecting ? 'Detecting...' : 'Auto-detect Windows'}
                </Button>

                {showDetectionResults && detectionResults.length > 1 && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Multiple windows detected:</p>
                    {detectionResults.map((result, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start gap-2 text-left"
                        onClick={() => selectDetectionResult(result)}
                      >
                        {result.shape === 'square' ? (
                          <Square className="w-4 h-4" />
                        ) : (
                          <Maximize className="w-4 h-4" />
                        )}
                        <span className="flex-1">
                          {result.shape === 'square' ? 'Square' : 'Rectangle'} 
                          <span className="text-muted-foreground ml-1">
                            ({Math.round(result.confidence * 100)}%)
                          </span>
                        </span>
                      </Button>
                    ))}
                  </div>
                )}
                
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

      {/* Mobile Floating Action Button for Auto-detect */}
      {isMobile && (
        <div className="fixed bottom-20 right-4 z-50">
          <Button
            onClick={autoDetect}
            disabled={isDetecting}
            className="rounded-full w-14 h-14 shadow-lg"
            size="lg"
          >
            {isDetecting ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Crosshair className="w-6 h-6" />
            )}
          </Button>
        </div>
      )}
    </div>
  );
}