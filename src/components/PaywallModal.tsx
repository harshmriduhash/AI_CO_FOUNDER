import React from 'react';
import { Shield, Check, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const plans = [
  {
    name: 'Starter',
    price: '49',
    features: [
      'Basic AI insights',
      'Strategic planning',
      '24/7 chat support',
      'Performance analytics',
      '1 project'
    ]
  },
  {
    name: 'Pro',
    price: '149',
    features: [
      'Advanced AI insights',
      'Custom strategy development',
      'Priority support',
      'Advanced analytics',
      '5 projects',
      'Team collaboration',
      'API access'
    ],
    popular: true
  },
  {
    name: 'Enterprise',
    price: '499',
    features: [
      'Full AI capabilities',
      'Dedicated AI instance',
      '24/7 priority support',
      'Custom integrations',
      'Unlimited projects',
      'Advanced security',
      'Custom reporting'
    ]
  }
];

export default function PaywallModal() {
  const navigate = useNavigate();
  const { updateSubscription } = useAuthStore();

  const handleSubscribe = async (plan: string) => {
    try {
      // In production, integrate with Stripe or another payment processor
      const subscription = {
        id: crypto.randomUUID(),
        plan: plan.toLowerCase(),
        status: 'active',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      };
      
      updateSubscription(subscription);
      navigate('/dashboard');
    } catch (error) {
      console.error('Subscription error:', error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50">
      <div className="max-w-6xl w-full mx-4 bg-gray-900 rounded-2xl p-8">
        <div className="text-center mb-12">
          <Shield className="h-16 w-16 text-blue-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">Choose Your Plan</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Get started with AIFounder and transform your startup journey. 
            Select the plan that best fits your needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative p-6 rounded-xl ${
                plan.popular
                  ? 'bg-gradient-to-b from-blue-600/20 to-purple-600/20 ring-2 ring-blue-500'
                  : 'bg-gray-800/50'
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-sm px-3 py-1 rounded-full">
                  Most Popular
                </span>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-bold">{plan.name}</h3>
                <div className="mt-2 flex items-baseline">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-gray-400 ml-2">/month</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <Check className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan.name)}
                className={`w-full py-3 rounded-lg flex items-center justify-center group ${
                  plan.popular
                    ? 'bg-blue-500 hover:bg-blue-600'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                Get Started
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}