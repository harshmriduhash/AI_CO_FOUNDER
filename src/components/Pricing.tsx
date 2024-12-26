import React from 'react';
import { Check, Zap, Shield, Rocket } from 'lucide-react';

interface PricingProps {
  onGetStarted: () => void;
}

const plans = [
  {
    name: "Starter",
    price: "49",
    icon: <Zap className="h-8 w-8 text-blue-500" />,
    features: [
      "Basic AI insights",
      "Strategic planning",
      "24/7 chat support",
      "Performance analytics",
      "1 project"
    ]
  },
  {
    name: "Pro",
    price: "149",
    icon: <Rocket className="h-8 w-8 text-purple-500" />,
    features: [
      "Advanced AI insights",
      "Custom strategy development",
      "Priority support",
      "Advanced analytics",
      "5 projects",
      "Team collaboration",
      "API access"
    ],
    popular: true
  },
  {
    name: "Enterprise",
    price: "499",
    icon: <Shield className="h-8 w-8 text-blue-500" />,
    features: [
      "Full AI capabilities",
      "Dedicated AI instance",
      "24/7 priority support",
      "Custom integrations",
      "Unlimited projects",
      "Advanced security",
      "Custom reporting"
    ]
  }
];

export default function Pricing({ onGetStarted }: PricingProps) {
  return (
    <div id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h2 className="text-4xl font-bold">Simple Pricing</h2>
          <p className="mt-4 text-xl text-gray-400">Choose the perfect plan for your startup</p>
        </div>
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div 
              key={index} 
              className={`relative p-8 rounded-xl ${
                plan.popular 
                  ? 'bg-gradient-to-b from-blue-600/20 to-purple-600/20 ring-2 ring-blue-500' 
                  : 'bg-gray-800/50 hover:bg-gray-800'
              } transition-colors`}
            >
              {plan.popular && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-sm px-3 py-1 rounded-full">
                  Most Popular
                </span>
              )}
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold">{plan.name}</h3>
                {plan.icon}
              </div>
              <div className="mt-4 flex items-baseline">
                <span className="text-4xl font-bold">${plan.price}</span>
                <span className="ml-2 text-gray-400">/month</span>
              </div>
              <ul className="mt-8 space-y-4">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    <Check className="h-5 w-5 text-blue-500 mr-2" />
                    {feature}
                  </li>
                ))}
              </ul>
              <button 
                onClick={onGetStarted}
                className={`mt-8 w-full py-3 rounded-lg transition-colors ${
                  plan.popular 
                    ? 'bg-blue-500 hover:bg-blue-600' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                Get Started
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}