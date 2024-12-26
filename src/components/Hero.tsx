import React from 'react';
import { ArrowRight, Sparkles, Bot, Cpu } from 'lucide-react';

interface HeroProps {
  onGetStarted: () => void;
}

export default function Hero({ onGetStarted }: HeroProps) {
  return (
    <div className="relative min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-gradient-conic from-blue-500/20 via-purple-500/20 to-blue-500/20 animate-pulse-slow"></div>
        <div className="absolute inset-0 bg-gray-900/90 backdrop-blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <Bot className="h-12 w-12 text-blue-500 animate-float" />
            <Sparkles className="h-8 w-8 text-purple-500 animate-pulse" />
            <Cpu className="h-12 w-12 text-blue-500 animate-float" style={{ animationDelay: '2s' }} />
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold">
            Your{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 animate-pulse-slow">
              AI Co-Founder
            </span>
          </h1>
          
          <p className="mt-6 text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
            Transform your startup journey with an AI partner that never sleeps. 
            Get instant insights, strategic planning, and execution support 24/7.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <button 
              onClick={onGetStarted}
              className="button-primary group flex items-center justify-center"
            >
              Start Building
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="button-secondary flex items-center justify-center group">
              Watch Demo
              <Sparkles className="ml-2 group-hover:rotate-12 transition-transform" />
            </button>
          </div>

          <div className="mt-16 relative">
            <div className="absolute inset-0 bg-gradient-radial from-blue-500/20 via-purple-500/10 to-transparent pointer-events-none" />
            <div className="glass-card hover-card rounded-xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=2070&q=80"
                alt="Team collaboration"
                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}