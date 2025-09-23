import React from 'react';
import { useApp } from '@/store/AppContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Camera, Upload, Sparkles, Share2 } from 'lucide-react';

export function LandingPage() {
  const { dispatch } = useApp();

  const handleGetStarted = () => {
    dispatch({ type: 'SET_STEP', payload: 'photo' });
  };

  return (
    <div className="flex-1 bg-warm-gradient">
      {/* Hero Section */}
      <section className="px-4 py-16 lg:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6">
            See Your Blinds in{' '}
            <span className="bg-accent-gradient bg-clip-text text-transparent">
              Your Home
            </span>{' '}
            Before Buying
          </h1>
          <p className="text-lg lg:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Take a photo of your window, select your preferred blinds or curtains, 
            and see exactly how they'll look with our advanced visualization technology.
          </p>
          <Button
            onClick={handleGetStarted}
            size="lg"
            className="btn-premium text-lg px-8 py-3 h-auto"
          >
            <Camera className="w-5 h-5 mr-2" />
            Get Started
          </Button>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-4 py-16 lg:px-6 bg-card">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            <Card className="card-premium p-6 text-center">
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Camera className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold mb-2">1. Take Photo</h3>
              <p className="text-muted-foreground text-sm">
                Capture or upload a photo of your window
              </p>
            </Card>
            
            <Card className="card-premium p-6 text-center">
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Upload className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold mb-2">2. Mark Window</h3>
              <p className="text-muted-foreground text-sm">
                Drag corner points to outline your window
              </p>
            </Card>
            
            <Card className="card-premium p-6 text-center">
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold mb-2">3. Choose Design</h3>
              <p className="text-muted-foreground text-sm">
                Browse and apply different blind styles
              </p>
            </Card>
            
            <Card className="card-premium p-6 text-center">
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Share2 className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold mb-2">4. Save & Share</h3>
              <p className="text-muted-foreground text-sm">
                Download or share your visualization
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-16 lg:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-8">
            Why Choose Decor?
          </h2>
          <div className="grid md:grid-cols-3 gap-8 text-left">
            <div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">
                Realistic Preview
              </h3>
              <p className="text-muted-foreground">
                Advanced perspective mapping technology shows exactly how blinds 
                will look in your space with accurate proportions and lighting.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">
                Extensive Catalog
              </h3>
              <p className="text-muted-foreground">
                Choose from hundreds of blind and curtain styles, colors, and 
                materials from top manufacturers.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">
                Easy Sharing
              </h3>
              <p className="text-muted-foreground">
                Share your visualizations with family, get quotes from dealers, 
                or save for later decision making.
              </p>
            </div>
          </div>
          
          <div className="mt-12">
            <Button
              onClick={handleGetStarted}
              size="lg"
              className="btn-accent text-lg px-8 py-3 h-auto"
            >
              Start Visualizing
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}