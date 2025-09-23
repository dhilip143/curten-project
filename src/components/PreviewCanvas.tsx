import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useApp } from '@/store/AppContext';
import { WindowCoordinates } from '@/types';
import { Blinds3D } from './Blinds3D';

interface PreviewCanvasProps {
  className?: string;
}

export function PreviewCanvas({ className = '' }: PreviewCanvasProps) {
  const { state } = useApp();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });

  // Simple homography transformation function
  const applyPerspective = useCallback((
    ctx: CanvasRenderingContext2D,
    textureImage: HTMLImageElement,
    coords: WindowCoordinates,
    canvasWidth: number,
    canvasHeight: number
  ) => {
    const { topLeft, topRight, bottomLeft, bottomRight } = coords;
    
    // Use original image dimensions for coordinate conversion
    const originalWidth = state.photo.originalDimensions?.width || canvasWidth;
    const originalHeight = state.photo.originalDimensions?.height || canvasHeight;
    
    // Convert normalized coordinates to original image coordinates
    const tl = { x: topLeft.x * originalWidth, y: topLeft.y * originalHeight };
    const tr = { x: topRight.x * originalWidth, y: topRight.y * originalHeight };
    const bl = { x: bottomLeft.x * originalWidth, y: bottomLeft.y * originalHeight };
    const br = { x: bottomRight.x * originalWidth, y: bottomRight.y * originalHeight };

    ctx.save();

    // Create clipping path for the window area
    ctx.beginPath();
    ctx.moveTo(tl.x, tl.y);
    ctx.lineTo(tr.x, tr.y);
    ctx.lineTo(br.x, br.y);
    ctx.lineTo(bl.x, bl.y);
    ctx.closePath();
    ctx.clip();

    // Apply opacity
    ctx.globalAlpha = state.transforms.opacity;

    // Simple perspective approximation using transform
    try {
      // Calculate the perspective transform matrix
      const width = Math.sqrt(Math.pow(tr.x - tl.x, 2) + Math.pow(tr.y - tl.y, 2));
      const height = Math.sqrt(Math.pow(bl.x - tl.x, 2) + Math.pow(bl.y - tl.y, 2));
      
      // Apply transforms
      const centerX = (tl.x + tr.x + bl.x + br.x) / 4;
      const centerY = (tl.y + tr.y + bl.y + br.y) / 4;
      
      ctx.translate(centerX, centerY);
      ctx.scale(state.transforms.scale, state.transforms.scale);
      ctx.rotate(state.transforms.rotation * Math.PI / 180);
      ctx.translate(0, state.transforms.verticalOffset * height / 100);
      ctx.translate(-centerX, -centerY);

      // Draw texture with perspective (simplified)
      if (state.transforms.isOpen) {
        ctx.drawImage(textureImage, tl.x, tl.y, width, height);
      } else {
        // Closed blind effect - draw only top portion
        const closedHeight = height * 0.1;
        ctx.drawImage(
          textureImage,
          0, 0, textureImage.width, textureImage.height * 0.1,
          tl.x, tl.y, width, closedHeight
        );
      }
    } catch (error) {
      console.warn('Perspective transformation failed, using fallback');
      // Fallback: simple rectangle fill
      ctx.fillStyle = '#cccccc';
      ctx.fillRect(tl.x, tl.y, tr.x - tl.x, bl.y - tl.y);
    }

    ctx.restore();
  }, [state.transforms]);

  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !state.photo.url || !state.windowCoords || !state.selectedProduct) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Load and draw background photo
    const backgroundImg = new Image();
    backgroundImg.onload = () => {
      // Draw background photo at original size
      const originalWidth = state.photo.originalDimensions?.width || backgroundImg.width;
      const originalHeight = state.photo.originalDimensions?.height || backgroundImg.height;
      ctx.drawImage(backgroundImg, 0, 0, originalWidth, originalHeight);

      // Load and draw texture
      const textureImg = new Image();
      textureImg.onload = () => {
        const originalWidth = state.photo.originalDimensions?.width || backgroundImg.width;
        const originalHeight = state.photo.originalDimensions?.height || backgroundImg.height;
        applyPerspective(ctx, textureImg, state.windowCoords!, originalWidth, originalHeight);
      };
      textureImg.onerror = () => {
        console.warn('Failed to load texture, using fallback');
        // Fallback texture
        const fallbackCanvas = document.createElement('canvas');
        fallbackCanvas.width = 200;
        fallbackCanvas.height = 200;
        const fallbackCtx = fallbackCanvas.getContext('2d');
        if (fallbackCtx) {
          fallbackCtx.fillStyle = '#e5e7eb';
          fallbackCtx.fillRect(0, 0, 200, 200);
          const originalWidth = state.photo.originalDimensions?.width || backgroundImg.width;
          const originalHeight = state.photo.originalDimensions?.height || backgroundImg.height;
          applyPerspective(ctx, fallbackCanvas as any, state.windowCoords!, originalWidth, originalHeight);
        }
      };
      textureImg.src = state.selectedProduct.texture;
    };
    backgroundImg.src = state.photo.url;
  }, [state.photo.url, state.photo.originalDimensions, state.windowCoords, state.selectedProduct, applyPerspective]);

  // Update canvas size based on original image dimensions
  useEffect(() => {
    const updateCanvasSize = () => {
      const canvas = canvasRef.current;
      if (!canvas || !state.photo.originalDimensions) return;

      const container = canvas.parentElement;
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const { width: originalWidth, height: originalHeight } = state.photo.originalDimensions;
      
      // Calculate scale to fit within container while maintaining aspect ratio
      const scaleX = containerRect.width / originalWidth;
      const scaleY = containerRect.height / originalHeight;
      const scale = Math.min(scaleX, scaleY, 1); // Don't scale up, only down if needed
      
      const width = originalWidth * scale;
      const height = originalHeight * scale;

      setCanvasSize({ width, height });
      canvas.width = originalWidth * window.devicePixelRatio;
      canvas.height = originalHeight * window.devicePixelRatio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, [state.photo.originalDimensions]);

  // Re-render when state changes
  useEffect(() => {
    renderCanvas();
  }, [renderCanvas, canvasSize]);

  const exportImage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    return new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/png', 1.0);
    });
  }, []);

  if (!state.photo.url || !state.windowCoords || !state.selectedProduct) {
    return (
      <div className={`flex items-center justify-center bg-muted rounded-lg ${className}`}>
        <p className="text-muted-foreground">Loading preview...</p>
      </div>
    );
  }

  // Render 3D blinds if product is 3D
  if (state.selectedProduct.is3D) {
    return (
      <div className={`relative bg-muted rounded-lg overflow-hidden ${className}`}>
        <Blinds3D
          windowCoords={state.windowCoords}
          transforms={state.transforms}
          texture={state.selectedProduct.texture}
          modelUrl={state.selectedProduct.modelUrl}
          backgroundImage={state.photo.url}
          className="w-full h-full"
        />
        <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
          3D Preview
        </div>
      </div>
    );
  }

  return (
    <div className={`relative bg-muted rounded-lg overflow-auto flex justify-center items-center ${className}`}>
      <canvas
        ref={canvasRef}
        className="block"
        style={{ maxWidth: '100%', maxHeight: '100%' }}
      />
      
      {/* Loading overlay */}
      {!state.photo.url && (
        <div className="absolute inset-0 bg-muted/50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Rendering preview...</p>
          </div>
        </div>
      )}
    </div>
  );
}