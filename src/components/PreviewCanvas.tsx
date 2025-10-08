import React, { useEffect, useRef, useCallback } from "react";
import { useApp } from "@/store/AppContext";
import { Blinds3D } from "./Blinds3D";
import { Palette } from "lucide-react";

interface PreviewCanvasProps {
  className?: string;
  onExportReady?: (exportFn: () => Promise<Blob | null>) => void;
}

export function PreviewCanvas({ className = "", onExportReady }: PreviewCanvasProps) {
  const { state, dispatch } = useApp();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // ✅ Automatically configure 3D curtain model
  const curtainModelUrl = "/curtain/curtain.glb"; // Path inside public/
  const curtainTexture = "/curtain/texture.jpg"; // Optional texture (or remove if your GLB has built-in material)

  // ✅ Export snapshot as PNG
  const exportImage = useCallback((): Promise<Blob | null> => {
    return new Promise<Blob | null>((resolve) => {
      const webglCanvas = document.querySelector("canvas") as HTMLCanvasElement;
      if (!webglCanvas) return resolve(null);

      // Wait briefly to ensure WebGL rendering is finished
      setTimeout(() => {
        webglCanvas.toBlob((blob) => {
          resolve(blob);
        }, "image/png");
      }, 200);
    });
  }, []);

  // ✅ Expose export function
  useEffect(() => {
    if (onExportReady) onExportReady(exportImage);
  }, [onExportReady, exportImage]);

  // ✅ Render 3D curtain scene directly
  return (
    <div className={`relative bg-muted rounded-lg overflow-hidden ${className}`}>
      <Blinds3D
        windowCoords={state.windowCoords}
        transforms={state.transforms}
        texture={curtainTexture}
        modelUrl={curtainModelUrl}
        backgroundImage={state.photo?.url}
        selectedTexture={state.selectedTexture}
        className="w-full h-full"
      />

      {/* Overlay label */}
      <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
        3D Curtain Preview
      </div>

      {/* Texture chooser (optional) */}
      {state.selectedProduct?.textureOptions?.length > 0 && (
        <div className="absolute bottom-4 left-4 right-4 bg-black/70 backdrop-blur-sm rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Palette className="w-4 h-4 text-white" />
            <h4 className="text-white font-medium text-sm">Choose Texture</h4>
          </div>

          <div className="flex gap-2 overflow-x-auto">
            {state.selectedProduct.textureOptions.map((texture) => (
              <button
                key={texture.id}
                className={`flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                  state.selectedTexture?.id === texture.id
                    ? "border-accent ring-2 ring-accent/50"
                    : "border-white/30 hover:border-white/60"
                }`}
                onClick={() =>
                  dispatch({ type: "SET_SELECTED_TEXTURE", payload: texture })
                }
              >
                <img
                  src={texture.thumbnail}
                  alt={texture.name}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>

          {state.selectedTexture && (
            <p className="text-white/80 text-xs mt-2">
              Selected: {state.selectedTexture.name}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
