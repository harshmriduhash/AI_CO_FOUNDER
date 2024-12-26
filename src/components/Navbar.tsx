import React from 'react';
import { Brain } from 'lucide-react';

interface NavbarProps {
  onGetStarted: () => void;
}

export default function Navbar({ onGetStarted }: NavbarProps) {
  return (
    <nav className="fixed w-full z-50 nav-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Brain className="h-8 w-8 text-blue-500" />
            <span className="ml-2 text-xl font-bold">AIFounder</span>
          </div>
          <div className="hidden md:block">
            <div className="flex items-center space-x-8">
              <a href="#features" className="hover:text-blue-400 transition-colors">Features</a>
              <a href="#testimonials" className="hover:text-blue-400 transition-colors">Testimonials</a>
              <a href="#pricing" className="hover:text-blue-400 transition-colors">Pricing</a>
              <button 
                onClick={onGetStarted}
                className="button-primary"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}