import React, { useState, useRef, useEffect } from 'react';
import { Code, Loader, CheckCircle, Copy, Download, Play, Terminal as TerminalIcon } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Terminal } from './Terminal';
import { Terminal as XTerm } from 'xterm';
import { initWebContainer, writeFiles, installDependencies, startDevServer, createFileTree } from '../../services/webcontainer';

interface Template {
  id: string;
  name: string;
  description: string;
  techStack: string[];
  features: string[];
  type: 'frontend' | 'backend' | 'fullstack';
}

interface CodeOutput {
  code: string;
  dependencies: string[];
  setup: string[];
  documentation: string;
  files?: Record<string, string>;
}

const templates: Template[] = [
  {
    id: 'next-saas',
    name: 'SaaS Platform',
    description: 'Full-stack SaaS application with authentication, payments, and dashboard',
    techStack: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Prisma', 'PostgreSQL'],
    features: ['User authentication', 'Payment integration', 'Dashboard', 'Settings'],
    type: 'fullstack'
  },
  {
    id: 'api-backend',
    name: 'REST API',
    description: 'Backend API with authentication, database, and documentation',
    techStack: ['Node.js', 'Express', 'TypeScript', 'PostgreSQL', 'Swagger'],
    features: ['JWT auth', 'CRUD operations', 'API docs', 'Rate limiting'],
    type: 'backend'
  },
  {
    id: 'react-dashboard',
    name: 'Admin Dashboard',
    description: 'React dashboard with charts, tables, and responsive design',
    techStack: ['React', 'TypeScript', 'Material UI', 'React Query'],
    features: ['Analytics', 'Data tables', 'Charts', 'Theme customization'],
    type: 'frontend'
  }
];

function CodeBuilder() {
  const { token } = useAuthStore();
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [customFeatures, setCustomFeatures] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<CodeOutput | null>(null);
  const [streamedContent, setStreamedContent] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'code' | 'setup' | 'docs' | 'preview'>('code');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [previewError, setPreviewError] = useState<string>('');
  const terminalRef = useRef<XTerm | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Initialize WebContainer when component mounts
    const init = async () => {
      try {
        await initWebContainer();
      } catch (error) {
        console.error('Failed to initialize WebContainer:', error);
        setPreviewError('Failed to initialize WebContainer. Please ensure your browser supports the required features.');
      }
    };
    init();
  }, []);

  const generateCode = async () => {
    if (!selectedTemplate) return;
    
    setIsGenerating(true);
    setStreamedContent('');
    
    try {
      const response = await fetch('/api/ai/generate-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          template: selectedTemplate.id,
          specifications: {
            type: selectedTemplate.type,
            techStack: selectedTemplate.techStack
          },
          features: [
            ...selectedTemplate.features,
            ...customFeatures.split('\n').filter(f => f.trim())
          ]
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate code');
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      // Handle streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        setStreamedContent(prev => prev + chunk);
      }

      // Parse the complete streamed content
      const parsedContent = parseStreamedContent(streamedContent);
      setGeneratedCode(parsedContent);
    } catch (error) {
      console.error('Code generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const parseStreamedContent = (content: string): CodeOutput => {
    // Split content into sections based on markers in the streamed response
    const sections = content.split('###');
    return {
      code: sections[0] || '',
      dependencies: (sections[1] || '').split('\n').filter(Boolean),
      setup: (sections[2] || '').split('\n').filter(Boolean),
      documentation: sections[3] || ''
    };
  };

  const copyToClipboard = async (text: string, section: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(section);
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const downloadCode = () => {
    if (!generatedCode || !selectedTemplate) return;

    const blob = new Blob([generatedCode.code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedTemplate.id}-generated.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleTerminalReady = (terminal: XTerm) => {
    terminalRef.current = terminal;
    terminal.write('\x1b[33mTerminal ready. Click "Run Code" to start the application.\x1b[0m\r\n');
  };
  const handleRunCode = async () => {
    try {
      await initWebContainer();
      // ... rest of the code
    } catch (error) {
      setPreviewError('Code preview is not available in this environment. Please ensure you are using a supported browser and configuration.');
      console.error('Failed to initialize WebContainer:', error);
    }
  };
  const runCode = async () => {
    if (!generatedCode || !terminalRef.current) return;
    
    setIsRunning(true);
    setPreviewError('');
    setPreviewUrl('');
    
    try {
      // Create and write files
      const fileTree = createFileTree(generatedCode);
      await writeFiles(fileTree);

      // Install dependencies
      terminalRef.current.write('\x1b[33mInstalling dependencies...\x1b[0m\r\n');
      await installDependencies(terminalRef.current);
      
      // Start dev server
      terminalRef.current.write('\x1b[33mStarting development server...\x1b[0m\r\n');
      const { url } = await startDevServer(terminalRef.current);
      
      setPreviewUrl(url);
      setActiveTab('preview');
    } catch (error) {
      console.error('Error running code:', error);
      setPreviewError('Failed to run the application. Check the terminal for details.');
      if (terminalRef.current) {
        terminalRef.current.write('\r\n\x1b[31mError running code. Check console for details.\x1b[0m\r\n');
      }
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">AI Code Builder</h2>
        <div className="flex gap-2">
          {generatedCode && (
            <>
              <button
                onClick={downloadCode}
                className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
              >
                <Download className="h-5 w-5 mr-2" />
                Download Code
              </button>
              <button
                onClick={runCode}
                disabled={isRunning}
                className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg disabled:opacity-50"
              >
                {isRunning ? (
                  <Loader className="h-5 w-5 mr-2 animate-spin" />
                ) : (
                  <Play className="h-5 w-5 mr-2" />
                )}
                Run Code
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Template Selection & Configuration */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => setSelectedTemplate(template)}
                className={`p-4 rounded-lg text-left transition-all ${
                  selectedTemplate?.id === template.id
                    ? 'bg-blue-600 ring-2 ring-blue-400'
                    : 'bg-gray-800 hover:bg-gray-700'
                }`}
              >
                <h3 className="font-semibold">{template.name}</h3>
                <p className="text-sm text-gray-300 mt-1">{template.description}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {template.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="text-xs px-2 py-1 bg-gray-700/50 rounded-full"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>

          {selectedTemplate && (
            <div className="bg-gray-800 rounded-lg p-4 space-y-4">
              <h3 className="font-semibold">Customize Features</h3>
              <div>
                <h4 className="text-sm text-gray-400 mb-2">Included Features:</h4>
                <ul className="space-y-1">
                  {selectedTemplate.features.map((feature) => (
                    <li key={feature} className="flex items-center text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-sm text-gray-400 mb-2">Additional Features:</h4>
                <textarea
                  value={customFeatures}
                  onChange={(e) => setCustomFeatures(e.target.value)}
                  placeholder="Add custom features (one per line)"
                  className="w-full bg-gray-700 rounded-lg px-4 py-2 min-h-[100px]"
                />
              </div>
              <button
                onClick={generateCode}
                disabled={isGenerating}
                className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-lg flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader className="h-5 w-5 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Code className="h-5 w-5" />
                    <span>Generate Code</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Generated Code Display */}
        {(generatedCode || streamedContent) && (
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="border-b border-gray-700">
              <div className="flex">
                <button
                  onClick={() => setActiveTab('code')}
                  className={`px-4 py-2 ${
                    activeTab === 'code' ? 'bg-gray-700 text-white' : 'text-gray-400'
                  }`}
                >
                  Code
                </button>
                <button
                  onClick={() => setActiveTab('setup')}
                  className={`px-4 py-2 ${
                    activeTab === 'setup' ? 'bg-gray-700 text-white' : 'text-gray-400'
                  }`}
                >
                  Setup
                </button>
                <button
                  onClick={() => setActiveTab('docs')}
                  className={`px-4 py-2 ${
                    activeTab === 'docs' ? 'bg-gray-700 text-white' : 'text-gray-400'
                  }`}
                >
                  Documentation
                </button>
                {previewUrl && (
                  <button
                    onClick={() => setActiveTab('preview')}
                    className={`px-4 py-2 ${
                      activeTab === 'preview' ? 'bg-gray-700 text-white' : 'text-gray-400'
                    }`}
                  >
                    Preview
                  </button>
                )}
              </div>
            </div>

            <div className="p-4">
              {activeTab === 'code' && (
                <div className="relative">
                  <button
                    onClick={() => copyToClipboard(generatedCode?.code || streamedContent, 'code')}
                    className="absolute top-2 right-2"
                  >
                    {copiedSection === 'code' ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <Copy className="h-5 w-5" />
                    )}
                  </button>
                  <pre className="text-sm overflow-x-auto p-4 bg-gray-900 rounded">
                    <code>{isGenerating ? streamedContent : generatedCode?.code}</code>
                  </pre>
                </div>
              )}

              {activeTab === 'setup' && generatedCode && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Dependencies</h3>
                    <ul className="space-y-1">
                      {generatedCode.dependencies.map((dep, index) => (
                        <li key={index} className="text-sm">{dep}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Setup Instructions</h3>
                    <ol className="list-decimal list-inside space-y-1">
                      {generatedCode.setup.map((step, index) => (
                        <li key={index} className="text-sm">{step}</li>
                      ))}
                    </ol>
                  </div>
                  <Terminal onReady={handleTerminalReady} className="mt-4" />
                </div>
              )}

              {activeTab === 'docs' && generatedCode && (
                <div className="prose prose-invert max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: generatedCode.documentation }} />
                </div>
              )}

              {activeTab === 'preview' && (
                <div className="space-y-4">
                  {previewError && (
                    <div className="bg-red-900/50 border border-red-500 text-red-200 p-4 rounded">
                      {previewError}
                    </div>
                  )}
                  {previewUrl && (
                    <div className="h-[600px] bg-white rounded-lg overflow-hidden">
                      <iframe
                        ref={iframeRef}
                        src={previewUrl}
                        className="w-full h-full border-0"
                        title="Preview"
                        sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                        allow="cross-origin-isolated"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CodeBuilder;
