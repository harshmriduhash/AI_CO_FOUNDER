import React from 'react';

const testimonials = [
  {
    quote: "AIFounder has been instrumental in helping us scale our startup. The strategic insights are invaluable.",
    author: "Sarah Chen",
    role: "CEO, TechVision",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80"
  },
  {
    quote: "Having an AI co-founder means we can move faster and make better decisions. It's like having a genius partner.",
    author: "Michael Rodriguez",
    role: "Founder, DataFlow",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80"
  },
  {
    quote: "The 24/7 support and real-time analysis have transformed how we operate. Couldn't imagine building without it.",
    author: "Emily Zhang",
    role: "CTO, CloudScale",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150&q=80"
  }
];

export default function Testimonials() {
  return (
    <div id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h2 className="text-4xl font-bold">Trusted by Founders</h2>
          <p className="mt-4 text-xl text-gray-400">See what other entrepreneurs are saying</p>
        </div>
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="p-6 rounded-xl bg-gray-800/50">
              <p className="text-lg italic">"{testimonial.quote}"</p>
              <div className="mt-6 flex items-center">
                <img
                  src={testimonial.image}
                  alt={testimonial.author}
                  className="h-12 w-12 rounded-full"
                />
                <div className="ml-4">
                  <p className="font-semibold">{testimonial.author}</p>
                  <p className="text-gray-400">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}