import React, { useState, useRef } from 'react';
import { useApp } from '@/store/AppContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Camera, Upload, RotateCcw, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function PhotoCapture() {
  const { state, dispatch } = useApp();
  const { toast } = useToast();
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = async () => {
    try {
      setIsCapturing(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: 1280, height: 720 }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please upload a photo instead.",
        variant: "destructive"
      });
      setIsCapturing(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCapturing(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedPhoto(imageData);
    stopCamera();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please select an image file.",
        variant: "destructive"
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setCapturedPhoto(result);
      
      // Get image dimensions
      const img = new Image();
      img.onload = () => {
        dispatch({
          type: 'SET_PHOTO',
          payload: {
            file,
            url: result,
            originalDimensions: { width: img.width, height: img.height }
          }
        });
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  const confirmPhoto = () => {
    if (!capturedPhoto) return;

    // Get image dimensions for canvas captured photo
    const img = new Image();
    img.onload = () => {
      dispatch({
        type: 'SET_PHOTO',
        payload: {
          url: capturedPhoto,
          originalDimensions: { width: img.width, height: img.height }
        }
      });
      dispatch({ type: 'SET_STEP', payload: 'window' });
    };
    img.src = capturedPhoto;
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
    // Clear the app state photo to go back to upload interface
    dispatch({ type: 'SET_PHOTO', payload: {} });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      // Trigger the file input dialog
      fileInputRef.current.click();
    }
  };

  const handleContinueWithUploaded = () => {
    dispatch({ type: 'SET_STEP', payload: 'window' });
  };

  // If we already have a photo from file upload, show continue option
  if (state.photo.url && !capturedPhoto) {
    return (
      <div className="flex-1 bg-background p-4 lg:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Photo Ready
            </h2>
            <p className="text-muted-foreground">
              Your photo has been uploaded successfully. Continue to mark your window.
            </p>
          </div>

          <Card className="card-premium p-6">
            <div className="bg-muted rounded-lg overflow-auto mb-6 flex justify-center items-center min-h-[300px]">
              <img
                src={state.photo.url}
                alt="Uploaded photo"
                className="max-w-full max-h-full object-contain"
              />
            </div>
            
            <div className="flex gap-4 justify-center">
              <Button
                onClick={retakePhoto}
                variant="outline"
                className="gap-2"
              >
                <Upload className="w-4 h-4" />
                Upload Different Photo
              </Button>
              <Button
                onClick={handleContinueWithUploaded}
                className="btn-premium gap-2"
              >
                <Check className="w-4 h-4" />
                Continue
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-background p-4 lg:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Take or Upload a Photo
          </h2>
          <p className="text-muted-foreground">
            {capturedPhoto ? 'Review your photo' : 'Hold phone steady; landscape works best'}
          </p>
        </div>

        {capturedPhoto ? (
          // Photo Review
          <Card className="card-premium p-6">
            <div className="bg-muted rounded-lg overflow-auto mb-6 flex justify-center items-center min-h-[300px]">
              <img
                src={capturedPhoto}
                alt="Captured photo"
                className="max-w-full max-h-full object-contain"
              />
            </div>
            
            <div className="flex gap-4 justify-center">
              <Button
                onClick={retakePhoto}
                variant="outline"
                className="gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Retake
              </Button>
              <Button
                onClick={confirmPhoto}
                className="btn-premium gap-2"
              >
                <Check className="w-4 h-4" />
                Use This Photo
              </Button>
            </div>
          </Card>
        ) : (
          // Capture Interface
          <div className="space-y-6">
            {isCapturing ? (
              <Card className="card-premium p-6">
                <div className="aspect-video bg-black rounded-lg overflow-hidden mb-6 relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-4 border-2 border-accent border-dashed rounded-lg pointer-events-none" />
                </div>
                
                <div className="flex gap-4 justify-center">
                  <Button
                    onClick={stopCamera}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={capturePhoto}
                    className="btn-premium gap-2 text-lg px-8"
                  >
                    <Camera className="w-5 h-5" />
                    Capture
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="card-premium p-8 text-center interactive" onClick={startCamera}>
                  <div className="w-16 h-16 bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Camera className="w-8 h-8 text-accent" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Take Photo</h3>
                  <p className="text-muted-foreground">
                    Use your device's camera to capture your window
                  </p>
                </Card>

                <Card className="card-premium p-8 text-center">
                  <div className="w-16 h-16 bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-8 h-8 text-accent" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Upload Photo</h3>
                  <p className="text-muted-foreground mb-4">
                    Choose an existing photo from your device
                  </p>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="btn-accent gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Select File
                  </Button>
                </Card>
              </div>
            )}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}