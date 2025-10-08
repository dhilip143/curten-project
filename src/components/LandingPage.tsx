import React from 'react';
import { useApp } from '@/store/AppContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Camera, Upload, Sparkles, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';

export function LandingPage() {
  const { dispatch } = useApp();

  const handleGetStarted = () => {
    dispatch({ type: 'SET_STEP', payload: 'photo' });
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <div className="flex-1 bg-warm-gradient min-h-screen">
      {/* Hero Section */}
      <section className="px-4 py-16 lg:px-6">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
        >
          <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
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
            className="bg-accent text-white hover:bg-accent-dark transition-all text-lg px-8 py-3 rounded-md flex items-center justify-center gap-2 mx-auto"
          >
            <Camera className="w-5 h-5" />
            Get Started
          </Button>
        </motion.div>
      </section>

      {/* How It Works */}
      <section className="px-4 py-16 lg:px-6 bg-card">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            className="text-3xl font-bold text-center text-foreground mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            How It Works
          </motion.h2>
          <div className="grid md:grid-cols-4 gap-6 md:gap-8">
            {[{
              icon: <Camera className="w-6 h-6 text-accent" />,
              title: '1. Take Photo',
              desc: 'Capture or upload a photo of your window',
            },{
              icon: <Upload className="w-6 h-6 text-accent" />,
              title: '2. Mark Window',
              desc: 'Drag corner points to outline your window',
            },{
              icon: <Sparkles className="w-6 h-6 text-accent" />,
              title: '3. Choose Design',
              desc: 'Browse and apply different blind styles',
            },{
              icon: <Share2 className="w-6 h-6 text-accent" />,
              title: '4. Save & Share',
              desc: 'Download or share your visualization',
            }].map((step, i) => (
              <motion.div
                key={i}
                className="card-premium p-6 text-center rounded-xl bg-white shadow-md hover:shadow-lg transition-all"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
              >
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  {step.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-16 lg:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            className="text-3xl font-bold text-foreground mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Why Choose Decor?
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-6 md:gap-8 text-left">
            {[
              { title: 'Realistic Preview', desc: 'Advanced perspective mapping technology shows exactly how blinds will look in your space with accurate proportions and lighting.' },
              { title: 'Extensive Catalog', desc: 'Choose from hundreds of blind and curtain styles, colors, and materials from top manufacturers.' },
              { title: 'Easy Sharing', desc: 'Share your visualizations with family, get quotes from dealers, or save for later decision making.' },
            ].map((feature, i) => (
              <motion.div
                key={i}
                className="bg-card p-6 rounded-lg shadow-md hover:shadow-lg transition-all"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
              >
                <h3 className="text-xl font-semibold mb-3 text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="mt-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Button
              onClick={handleGetStarted}
              size="lg"
              className="bg-accent text-white hover:bg-accent-dark transition-all text-lg px-8 py-3 rounded-md"
            >
              Start Visualizing
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
