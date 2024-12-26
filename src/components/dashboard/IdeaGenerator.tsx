// src/components/dashboard/IdeaGenerator.tsx
import React, { useState } from 'react';
import { Sparkles, Loader, ChevronDown, Check } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface IdeaFormData {
  industry: string;
  targetMarket: string;
  technology: string[];
  problemSpace: string;
}

interface GeneratedIdea {
  name: string;
  pitch: string;
  description: string;
  keyFeatures: string[];
  targetAudience: string;
  revenueModel: string;
  challenges: string[];
  growthStrategy: string;
}

const industries = [
  'Technology', 'Healthcare', 'Education', 'Finance', 
  'E-commerce', 'Sustainability', 'Entertainment'
];

const technologies = [
  'AI/ML', 'Blockchain', 'IoT', 'Mobile', 'Cloud',
  'AR/VR', 'Robotics', 'Web3', '5G', 'Green Tech'
];

const marketSizes = [
  'B2C - Mass Market',
  'B2C - Niche Market',
  'B2B - Enterprise',
  'B2B - SMB',
  'B2B2C'
];

function IdeaGenerator() {
  const { token } = useAuthStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<IdeaFormData>({
    industry: '',
    targetMarket: '',
    technology: [],
    problemSpace: ''
  });
  const [generatedIdea, setGeneratedIdea] = useState<GeneratedIdea | null>(null);

  const handleTechnologyToggle = (tech: string) => {
    setFormData(prev => ({
      ...prev,
      technology: prev.technology.includes(tech)
        ? prev.technology.filter(t => t !== tech)
        : [...prev.technology, tech]
    }));
  };

  const generateIdea = async () => {
    if (!token) {
      setError('Authentication required');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 1 minute timeout

      const response = await fetch('/api/ai/generate-idea', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate idea');
      }

      const data = await response.json();
      setGeneratedIdea(data);
    } catch (error) {
      console.error('Idea generation error:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate idea');

      if (error instanceof DOMException && error.name === 'AbortError') {
        setError('Request timed out. Please try again.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const isFormValid = () => {
    return formData.industry && 
           formData.targetMarket && 
           formData.technology.length > 0 && 
           formData.problemSpace.trim().length > 0;
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">AI Startup Idea Generator</h2>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-2 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Input Form */}
        <div className="space-y-6 bg-gray-800/50 p-6 rounded-xl">
          <div>
            <label className="block text-sm font-medium mb-2">Industry</label>
            <select
              value={formData.industry}
              onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
              className="w-full bg-gray-700 rounded-lg px-4 py-2"
            >
              <option value="">Select Industry</option>
              {industries.map(industry => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Target Market</label>
            <select
              value={formData.targetMarket}
              onChange={(e) => setFormData(prev => ({ ...prev, targetMarket: e.target.value }))}
              className="w-full bg-gray-700 rounded-lg px-4 py-2"
            >
              <option value="">Select Target Market</option>
              {marketSizes.map(market => (
                <option key={market} value={market}>{market}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Technologies</label>
            <div className="grid grid-cols-2 gap-2">
              {technologies.map(tech => (
                <button
                  key={tech}
                  onClick={() => handleTechnologyToggle(tech)}
                  type="button"
                  className={`px-3 py-2 rounded-lg text-sm flex items-center justify-between ${
                    formData.technology.includes(tech)
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  {tech}
                  {formData.technology.includes(tech) && (
                    <Check className="h-4 w-4 ml-2" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Problem Space</label>
            <textarea
              value={formData.problemSpace}
              onChange={(e) => setFormData(prev => ({ ...prev, problemSpace: e.target.value }))}
              placeholder="Describe the problem your startup should solve..."
              className="w-full bg-gray-700 rounded-lg px-4 py-2 min-h-[100px] resize-y"
            />
          </div>

          <button
            onClick={generateIdea}
            disabled={isGenerating || !isFormValid()}
            className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <Loader className="h-5 w-5 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                <span>Generate Idea</span>
              </>
            )}
          </button>
        </div>

        {/* Results Display */}
        <div className="bg-gray-800/50 p-6 rounded-xl">
          {generatedIdea ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold mb-2">{generatedIdea.name}</h3>
                <p className="text-blue-400 font-medium">{generatedIdea.pitch}</p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-gray-300">{generatedIdea.description}</p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Key Features</h4>
                <ul className="list-disc list-inside space-y-1">
                  {generatedIdea.keyFeatures.map((feature, index) => (
                    <li key={index} className="text-gray-300">{feature}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-2">Target Audience</h4>
                <p className="text-gray-300">{generatedIdea.targetAudience}</p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Revenue Model</h4>
                <p className="text-gray-300">{generatedIdea.revenueModel}</p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Potential Challenges</h4>
                <ul className="list-disc list-inside space-y-1">
                  {generatedIdea.challenges.map((challenge, index) => (
                    <li key={index} className="text-gray-300">{challenge}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-2">Growth Strategy</h4>
                <p className="text-gray-300">{generatedIdea.growthStrategy}</p>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              <p>Generated idea will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default IdeaGenerator;