import React from 'react';
import { useApp } from '@/store/AppContext';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { RotateCcw, Undo2, Redo2, Eye, EyeOff } from 'lucide-react';

export function ControlsPanel() {
  const { state, dispatch } = useApp();

  const handleOpacityChange = (values: number[]) => {
    dispatch({
      type: 'UPDATE_TRANSFORMS',
      payload: { opacity: values[0] / 100 }
    });
  };

  const handleScaleChange = (values: number[]) => {
    dispatch({
      type: 'UPDATE_TRANSFORMS',
      payload: { scale: values[0] / 100 }
    });
  };

  const handleVerticalScaleChange = (values: number[]) => {
    dispatch({
      type: 'UPDATE_TRANSFORMS',
      payload: { verticalScale: values[0] / 100 }
    });
  };

  const handleHorizontalScaleChange = (values: number[]) => {
    dispatch({
      type: 'UPDATE_TRANSFORMS',
      payload: { horizontalScale: values[0] / 100 }
    });
  };

  const handleVerticalOffsetChange = (values: number[]) => {
    dispatch({
      type: 'UPDATE_TRANSFORMS',
      payload: { verticalOffset: values[0] }
    });
  };

  const handleHorizontalOffsetChange = (values: number[]) => {
    dispatch({
      type: 'UPDATE_TRANSFORMS',
      payload: { horizontalOffset: values[0] }
    });
  };

  const handleRotationChange = (values: number[]) => {
    dispatch({
      type: 'UPDATE_TRANSFORMS',
      payload: { rotation: values[0] }
    });
  };

  const handleToggleOpen = (checked: boolean) => {
    dispatch({
      type: 'UPDATE_TRANSFORMS',
      payload: { isOpen: checked }
    });
  };

  const resetTransforms = () => {
    dispatch({
      type: 'UPDATE_TRANSFORMS',
      payload: {
        opacity: 0.9,
        scale: 1,
        verticalScale: 1,
        horizontalScale: 1,
        verticalOffset: 0,
        horizontalOffset: 0,
        rotation: 0,
        isOpen: true,
      }
    });
  };

  if (!state.selectedProduct) {
    return null;
  }

  return (
    <Card className="card-premium p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Adjust Design</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={resetTransforms}
          className="gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="blind-state" className="text-sm font-medium">
            Blind State
          </Label>
          <div className="flex items-center gap-2">
            <EyeOff className="w-4 h-4 text-muted-foreground" />
            <Switch
              id="blind-state"
              checked={state.transforms.isOpen}
              onCheckedChange={handleToggleOpen}
            />
            <Eye className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          {state.transforms.isOpen ? 'Blinds are open' : 'Blinds are closed'}
        </p>
      </div>

      {/* Opacity Control */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Opacity</Label>
          <span className="text-sm text-muted-foreground">
            {Math.round(state.transforms.opacity * 100)}%
          </span>
        </div>
        <Slider
          value={[state.transforms.opacity * 100]}
          onValueChange={handleOpacityChange}
          min={10}
          max={100}
          step={5}
          className="w-full"
        />
      </div>

      {/* Scale Control */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Scale</Label>
          <span className="text-sm text-muted-foreground">
            {Math.round(state.transforms.scale * 100)}%
          </span>
        </div>
        <Slider
          value={[state.transforms.scale * 100]}
          onValueChange={handleScaleChange}
          min={50}
          max={150}
          step={5}
          className="w-full"
        />
      </div>

      {/* Vertical Scale Control */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Vertical Scale</Label>
          <span className="text-sm text-muted-foreground">
            {Math.round(state.transforms.verticalScale * 100)}%
          </span>
        </div>
        <Slider
          value={[state.transforms.verticalScale * 100]}
          onValueChange={handleVerticalScaleChange}
          min={50}
          max={200}
          step={5}
          className="w-full"
        />
      </div>

      {/* Horizontal Scale Control */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Horizontal Scale</Label>
          <span className="text-sm text-muted-foreground">
            {Math.round(state.transforms.horizontalScale * 100)}%
          </span>
        </div>
        <Slider
          value={[state.transforms.horizontalScale * 100]}
          onValueChange={handleHorizontalScaleChange}
          min={50}
          max={200}
          step={5}
          className="w-full"
        />
      </div>

      {/* Vertical Offset Control */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Vertical Position</Label>
          <span className="text-sm text-muted-foreground">
            {state.transforms.verticalOffset > 0 ? '+' : ''}{state.transforms.verticalOffset}%
          </span>
        </div>
        <Slider
          value={[state.transforms.verticalOffset]}
          onValueChange={handleVerticalOffsetChange}
          min={-20}
          max={20}
          step={1}
          className="w-full"
        />
      </div>

      {/* Horizontal Offset Control */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Horizontal Position</Label>
          <span className="text-sm text-muted-foreground">
            {state.transforms.horizontalOffset > 0 ? '+' : ''}{state.transforms.horizontalOffset}%
          </span>
        </div>
        <Slider
          value={[state.transforms.horizontalOffset]}
          onValueChange={handleHorizontalOffsetChange}
          min={-20}
          max={20}
          step={1}
          className="w-full"
        />
      </div>

      {/* Rotation Control */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Rotation</Label>
          <span className="text-sm text-muted-foreground">
            {state.transforms.rotation}°
          </span>
        </div>
        <Slider
          value={[state.transforms.rotation]}
          onValueChange={handleRotationChange}
          min={-10}
          max={10}
          step={0.5}
          className="w-full"
        />
      </div>

      {/* History Controls */}
      <div className="pt-4 border-t border-border">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-2"
            disabled
          >
            <Undo2 className="w-4 h-4" />
            Undo
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-2"
            disabled
          >
            <Redo2 className="w-4 h-4" />
            Redo
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          History controls coming soon
        </p>
      </div>

      {/* Product Info */}
      <div className="pt-4 border-t border-border">
        <h4 className="font-medium text-sm mb-2">Current Selection</h4>
        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
          <img
            src={state.selectedProduct.thumbnail}
            alt={state.selectedProduct.name}
            className="w-12 h-12 rounded object-cover"
          />
          <div>
            <p className="font-medium text-sm">{state.selectedProduct.name}</p>
            <p className="text-xs text-muted-foreground capitalize">
              {state.selectedProduct.category}
            </p>
            {state.selectedProduct.price && (
              <p className="text-sm font-semibold text-accent">
                ${state.selectedProduct.price}
              </p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}