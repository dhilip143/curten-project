import React, { useState, useRef, useEffect } from 'react';
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
  const [cameraError, setCameraError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = async () => {
    try {
      setCameraError(false);
      setIsCapturing(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' } // remove width/height to allow auto
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (error) {
      setCameraError(true);
      setIsCapturing(false);
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please upload a photo instead.",
        variant: "destructive"
      });
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
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedPhoto(imageData);
    stopCamera();
  };

  const confirmPhoto = () => {
    if (!capturedPhoto) return;
    const img = new Image();
    img.onload = () => {
      dispatch({
        type: 'SET_PHOTO',
        payload: { url: capturedPhoto, originalDimensions: { width: img.width, height: img.height } }
      });
      dispatch({ type: 'SET_STEP', payload: 'window' });
    };
    img.src = capturedPhoto;
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
      const img = new Image();
      img.onload = () => {
        dispatch({
          type: 'SET_PHOTO',
          payload: { file, url: result, originalDimensions: { width: img.width, height: img.height } }
        });
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
    dispatch({ type: 'SET_PHOTO', payload: {} });
    fileInputRef.current?.click();
  };

  const handleContinueWithUploaded = () => {
    dispatch({ type: 'SET_STEP', payload: 'window' });
  };

  return (
    <div className="flex-1 bg-background p-4 lg:p-6 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-4">Take or Upload a Photo</h2>
          <p className="text-muted-foreground">
            {capturedPhoto ? 'Review your photo' : 'Hold phone steady; landscape works best'}
          </p>
        </div>

        {capturedPhoto ? (
          <Card className="card-premium p-6">
            <div className="bg-muted rounded-lg overflow-auto mb-6 flex justify-center items-center min-h-[300px]">
              <img src={capturedPhoto} alt="Captured" className="max-w-full max-h-full object-contain" />
            </div>
            <div className="flex gap-4 justify-center">
              <Button onClick={retakePhoto} variant="outline" className="gap-2">
                <RotateCcw className="w-4 h-4" />
                Retake
              </Button>
              <Button onClick={confirmPhoto} className="btn-premium gap-2">
                <Check className="w-4 h-4" />
                Use This Photo
              </Button>
            </div>
          </Card>
        ) : isCapturing ? (
          <Card className="card-premium p-6">
            {cameraError ? (
              <p className="text-red-500 text-center">Camera not available. Please upload a photo.</p>
            ) : (
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden mb-6">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                <div className="absolute inset-4 border-2 border-accent border-dashed rounded-lg pointer-events-none" />
              </div>
            )}
            <div className="flex gap-4 justify-center">
              <Button onClick={stopCamera} variant="outline">Cancel</Button>
              <Button onClick={capturePhoto} className="btn-premium gap-2">
                <Camera className="w-5 h-5" />
                Capture
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="card-premium p-8 text-center cursor-pointer" onClick={startCamera}>
              <div className="w-16 h-16 bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Camera className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Take Photo</h3>
              <p className="text-muted-foreground">Use your device camera to capture your window</p>
            </Card>

            <Card className="card-premium p-8 text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Upload Photo</h3>
              <p className="text-muted-foreground mb-4">Choose an existing photo from your device</p>
              <Button onClick={() => fileInputRef.current?.click()} className="btn-accent gap-2">
                <Upload className="w-4 h-4" />
                Select File
              </Button>
            </Card>
          </div>
        )}

        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
