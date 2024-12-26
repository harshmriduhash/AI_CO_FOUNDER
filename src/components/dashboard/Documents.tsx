import React, { useState } from 'react';
import { FileText, Loader, Plus, Download, Trash2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

type DocumentType = 'pitch_deck' | 'business_plan' | 'marketing_plan' | 'financial_projection' | 'executive_summary';

interface Document {
  id: string;
  type: DocumentType;
  title: string;
  content: string;
  createdAt: Date;
}

interface BusinessInfo {
  name: string;
  industry: string;
  stage: string;
  target: string;
}

interface GenerateDocumentParams {
  type: DocumentType;
  businessInfo: BusinessInfo;
  audience: string;
  purpose: string;
  tone: string;
}

const documentTypes: Record<DocumentType, string> = {
  pitch_deck: 'Pitch Deck',
  business_plan: 'Business Plan',
  marketing_plan: 'Marketing Plan',
  financial_projection: 'Financial Projections',
  executive_summary: 'Executive Summary'
};

const toneOptions = [
  'professional',
  'conversational',
  'technical',
  'persuasive',
  'formal'
] as const;

const stageOptions = [
  { value: 'idea', label: 'Idea Stage' },
  { value: 'mvp', label: 'MVP' },
  { value: 'early', label: 'Early Stage' },
  { value: 'growth', label: 'Growth Stage' },
  { value: 'scale', label: 'Scale-up' }
] as const;

function Documents() {
  const { token } = useAuthStore();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showNewDocumentForm, setShowNewDocumentForm] = useState(false);
  const [formData, setFormData] = useState<GenerateDocumentParams>({
    type: 'pitch_deck',
    businessInfo: {
      name: '',
      industry: '',
      stage: '',
      target: ''
    },
    audience: '',
    purpose: '',
    tone: 'professional'
  });

  const generateDocument = async (retries = 3) => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai/generate-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to generate document');
      }

      const data = await response.json();
      const newDocument: Document = {
        id: crypto.randomUUID(),
        type: formData.type,
        title: `${documentTypes[formData.type]} - ${formData.businessInfo.name}`,
        content: data.document,
        createdAt: new Date()
      };

      setDocuments(prev => [newDocument, ...prev]);
      setShowNewDocumentForm(false);
      resetForm();
    } catch (error) {
      console.error('Document generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'pitch_deck',
      businessInfo: {
        name: '',
        industry: '',
        stage: '',
        target: ''
      },
      audience: '',
      purpose: '',
      tone: 'professional'
    });
  };

  const deleteDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
  };

  const downloadDocument = (doc: Document) => {
    const blob = new Blob([doc.content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${doc.title}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const updateBusinessInfo = (field: keyof BusinessInfo, value: string) => {
    setFormData(prev => ({
      ...prev,
      businessInfo: {
        ...prev.businessInfo,
        [field]: value
      }
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Business Documents</h2>
        <button
          onClick={() => setShowNewDocumentForm(true)}
          className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Document
        </button>
      </div>

      {showNewDocumentForm && (
        <div className="bg-gray-800 rounded-lg p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Document Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as DocumentType }))}
                className="w-full bg-gray-700 rounded-lg px-4 py-2"
              >
                {Object.entries(documentTypes).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Business Name</label>
              <input
                type="text"
                value={formData.businessInfo.name}
                onChange={(e) => updateBusinessInfo('name', e.target.value)}
                className="w-full bg-gray-700 rounded-lg px-4 py-2"
                placeholder="Enter business name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Industry</label>
              <input
                type="text"
                value={formData.businessInfo.industry}
                onChange={(e) => updateBusinessInfo('industry', e.target.value)}
                className="w-full bg-gray-700 rounded-lg px-4 py-2"
                placeholder="Enter industry"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Business Stage</label>
              <select
                value={formData.businessInfo.stage}
                onChange={(e) => updateBusinessInfo('stage', e.target.value)}
                className="w-full bg-gray-700 rounded-lg px-4 py-2"
              >
                <option value="">Select Stage</option>
                {stageOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Target Audience</label>
              <input
                type="text"
                value={formData.audience}
                onChange={(e) => setFormData(prev => ({ ...prev, audience: e.target.value }))}
                className="w-full bg-gray-700 rounded-lg px-4 py-2"
                placeholder="Who is this document for?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Document Purpose</label>
              <input
                type="text"
                value={formData.purpose}
                onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
                className="w-full bg-gray-700 rounded-lg px-4 py-2"
                placeholder="What's the goal of this document?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Tone</label>
              <select
                value={formData.tone}
                onChange={(e) => setFormData(prev => ({ ...prev, tone: e.target.value }))}
                className="w-full bg-gray-700 rounded-lg px-4 py-2"
              >
                {toneOptions.map(tone => (
                  <option key={tone} value={tone}>
                    {tone.charAt(0).toUpperCase() + tone.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              onClick={() => setShowNewDocumentForm(false)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={() => generateDocument()}
              disabled={isGenerating}
              className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader className="h-5 w-5 animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="h-5 w-5 mr-2" />
                  Generate Document
                </>
              )}
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {documents.map((document) => (
          <div key={document.id} className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-sm bg-blue-600/30 text-blue-400 px-2 py-1 rounded">
                  {documentTypes[document.type]}
                </span>
                <h3 className="mt-2 font-medium">{document.title}</h3>
                <p className="text-sm text-gray-400 mt-1">
                  {document.createdAt.toLocaleDateString()}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => downloadDocument(document)}
                  className="p-1 hover:bg-gray-700 rounded"
                  title="Download"
                >
                  <Download className="h-4 w-4" />
                </button>
                <button
                  onClick={() => deleteDocument(document.id)}
                  className="p-1 hover:bg-gray-700 rounded text-red-400"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {documents.length === 0 && !showNewDocumentForm && (
        <div className="text-center py-12 bg-gray-800 rounded-lg">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400">No documents yet. Click "New Document" to get started.</p>
        </div>
      )}
    </div>
  );
}

export default Documents;