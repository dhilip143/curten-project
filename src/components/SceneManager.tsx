import React, { useState } from 'react';
import { useApp } from '@/store/AppContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { 
  Save, 
  Share2, 
  Download, 
  Mail, 
  Copy, 
  ExternalLink,
  Loader2 
} from 'lucide-react';

export function SceneManager() {
  const { state, dispatch } = useApp();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  const saveScene = async () => {
    if (!state.photo.url || !state.windowCoords || !state.selectedProduct) {
      toast({
        title: "Cannot Save",
        description: "Please complete the visualization first.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    
    try {
      // Mock API call - in real implementation, this would save to backend
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const sceneId = Math.random().toString(36).substring(7);
      const mockShareUrl = `https://decor.app/scene/${sceneId}`;
      
      setShareUrl(mockShareUrl);
      
      dispatch({
        type: 'SET_SCENE',
        payload: {
          id: sceneId,
          photoUrl: state.photo.url,
          windowCoords: state.windowCoords,
          productId: state.selectedProduct.id,
          transforms: state.transforms,
          shareUrl: mockShareUrl
        }
      });

      toast({
        title: "Scene Saved!",
        description: "Your visualization has been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Unable to save scene. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const shareScene = async () => {
    if (!state.scene?.shareUrl && !shareUrl) {
      await saveScene();
      return;
    }

    const url = state.scene?.shareUrl || shareUrl;
    
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link Copied!",
        description: "Shareable link copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Unable to copy link. Please copy manually.",
        variant: "destructive"
      });
    }
  };

  const downloadImage = async () => {
    setIsExporting(true);
    
    try {
      // Mock export - in real implementation, this would render high-quality image
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create download link
      const link = document.createElement('a');
      link.download = `decor-design-${Date.now()}.png`;
      
      // In real implementation, you would get the canvas blob
      // For now, we'll use a placeholder
      const canvas = document.createElement('canvas');
      canvas.width = 1920;
      canvas.height = 1080;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#f3f4f6';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#374151';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Decor Preview', canvas.width / 2, canvas.height / 2);
      }
      
      canvas.toBlob((blob) => {
        if (blob) {
          link.href = URL.createObjectURL(blob);
          link.click();
          URL.revokeObjectURL(link.href);
        }
      });

      toast({
        title: "Download Complete",
        description: "Your visualization has been downloaded.",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Unable to download image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const requestQuote = () => {
    if (!state.selectedProduct) return;

    const subject = `Quote Request - ${state.selectedProduct.name}`;
    const body = `Hi,

I would like to request a quote for the following blind/curtain:

Product: ${state.selectedProduct.name}
Category: ${state.selectedProduct.category}
${state.selectedProduct.price ? `Price: $${state.selectedProduct.price}` : ''}

I have created a visualization that shows how this product would look in my space. 
${state.scene?.shareUrl ? `You can view it here: ${state.scene.shareUrl}` : ''}

Please contact me with pricing and installation details.

Thank you!`;

    const mailtoLink = `mailto:quotes@decor.app?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
  };

  if (!state.selectedProduct) return null;

  return (
    <Card className="card-premium p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Save & Share</h3>
        <p className="text-sm text-muted-foreground">
          Save your design, share with others, or request a quote
        </p>
      </div>

      {/* Save Scene */}
      <div className="space-y-3">
        <Button
          onClick={saveScene}
          disabled={isSaving}
          className="w-full btn-premium gap-2"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {isSaving ? 'Saving...' : 'Save Design'}
        </Button>
        
        {state.scene && (
          <div className="text-xs text-muted-foreground text-center">
            ✓ Saved as Scene #{state.scene.id}
          </div>
        )}
      </div>

      {/* Share Options */}
      <div className="space-y-3">
        <Button
          onClick={shareScene}
          variant="outline"
          className="w-full gap-2"
        >
          <Share2 className="w-4 h-4" />
          Share Link
        </Button>

        {(state.scene?.shareUrl || shareUrl) && (
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                value={state.scene?.shareUrl || shareUrl}
                readOnly
                className="text-xs"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={shareScene}
                className="shrink-0"
              >
                <Copy className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(state.scene?.shareUrl || shareUrl, '_blank')}
                className="shrink-0"
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Download */}
      <div>
        <Button
          onClick={downloadImage}
          disabled={isExporting}
          variant="outline"
          className="w-full gap-2"
        >
          {isExporting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          {isExporting ? 'Exporting...' : 'Download Image'}
        </Button>
      </div>

      {/* Request Quote */}
      <div className="pt-4 border-t border-border">
        <Button
          onClick={requestQuote}
          className="w-full btn-accent gap-2"
        >
          <Mail className="w-4 h-4" />
          Request Quote
        </Button>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Get pricing and installation details from our dealers
        </p>
      </div>

      {/* Scene Details */}
      {state.scene && (
        <div className="pt-4 border-t border-border text-xs text-muted-foreground space-y-1">
          <div className="flex justify-between">
            <span>Scene ID:</span>
            <span className="font-mono">{state.scene.id}</span>
          </div>
          <div className="flex justify-between">
            <span>Product:</span>
            <span>{state.selectedProduct.name}</span>
          </div>
          <div className="flex justify-between">
            <span>Opacity:</span>
            <span>{Math.round(state.transforms.opacity * 100)}%</span>
          </div>
          <div className="flex justify-between">
            <span>Scale:</span>
            <span>{Math.round(state.transforms.scale * 100)}%</span>
          </div>
        </div>
      )}
    </Card>
  );
}