import React from 'react';
import { Brain, Rocket, Zap, MessageSquare, Shield, BarChart2, Users, Clock, Globe, Lock, Sparkles } from 'lucide-react';

const features = [
  {
    icon: <Brain className="h-8 w-8 text-blue-500" />,
    title: "Strategic Planning",
    description: "Get data-driven insights and strategic recommendations for your startup's growth"
  },
  {
    icon: <Rocket className="h-8 w-8 text-purple-500" />,
    title: "Execution Support",
    description: "Turn plans into action with AI-powered project management and task automation"
  },
  {
    icon: <BarChart2 className="h-8 w-8 text-blue-500" />,
    title: "Real-time Analytics",
    description: "Monitor your startup's performance with advanced metrics and predictive insights"
  },
  {
    icon: <MessageSquare className="h-8 w-8 text-purple-500" />,
    title: "24/7 Assistance",
    description: "Get answers and support whenever you need it, day or night"
  },
  {
    icon: <Users className="h-8 w-8 text-blue-500" />,
    title: "Team Collaboration",
    description: "Foster seamless communication and alignment across your entire team"
  },
  {
    icon: <Clock className="h-8 w-8 text-purple-500" />,
    title: "Time Management",
    description: "Optimize your schedule and prioritize tasks effectively"
  },
  {
    icon: <Globe className="h-8 w-8 text-blue-500" />,
    title: "Market Analysis",
    description: "Stay ahead with real-time market trends and competitor analysis"
  },
  {
    icon: <Lock className="h-8 w-8 text-purple-500" />,
    title: "Security First",
    description: "Enterprise-grade security to protect your sensitive business data"
  },
  {
    icon: <Sparkles className="h-8 w-8 text-blue-500" />,
    title: "Innovation Hub",
    description: "Generate and validate new ideas with AI-powered brainstorming"
  }
];

export default function Features() {
  return (
    <div id="features" className="relative py-20 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-900/95 to-gray-900"></div>
      <div className="relative max-w-7xl mx-auto">
        <div className="text-center">
          <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            Powerful Features
          </h2>
          <p className="mt-4 text-xl text-gray-400">
            Everything you need to build and scale your startup
          </p>
        </div>
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="glass-card card-hover-effect rounded-xl p-6 hover-card"
            >
              <div className="relative z-10">
                {feature.icon}
                <h3 className="mt-4 text-xl font-semibold">{feature.title}</h3>
                <p className="mt-2 text-gray-400">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}