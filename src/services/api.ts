import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  signup: async (email: string, password: string, name: string) => {
    const response = await api.post('/auth/signup', { email, password, name });
    return response.data;
  },
  refreshToken: async () => {
    const response = await api.post('/auth/refresh-token');
    return response.data;
  }
};

// Chat API
export const chatService = {
  sendMessage: async (message: string) => {
    const response = await api.post('/chat/message', { message });
    return response.data;
  },
  getHistory: async () => {
    const response = await api.get('/chat/history');
    return response.data;
  }
};

// Ideas API
export interface IdeaGenerationParams {
  industry?: string;
  technology?: string[];
  marketSize?: 'small' | 'medium' | 'large';
  timeframe?: 'short' | 'medium' | 'long';
}

export interface BusinessIdea {
  id: string;
  title: string;
  description: string;
  keyFeatures: string[];
  targetAudience: string;
  revenueModel: string;
  timestamp: string;
}

export const ideaService = {
  getAll: async () => {
    const response = await api.get('/ideas');
    return response.data;
  },
  create: async (idea: BusinessIdea) => {
    const response = await api.post('/ideas', idea);
    return response.data;
  },
  update: async (id: string, idea: Partial<BusinessIdea>) => {
    const response = await api.put(`/ideas/${id}`, idea);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/ideas/${id}`);
    return response.data;
  },
  generate: async (params: IdeaGenerationParams) => {
    const response = await api.post('/ideas/generate', params);
    return response.data;
  }
};

// Documents API
export const documentService = {
  getAll: async () => {
    const response = await api.get('/documents');
    return response.data;
  },
  generate: async (type: string, params: any) => {
    const response = await api.post('/documents/generate', { type, ...params });
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/documents/${id}`);
    return response.data;
  }
};

// Code Builder API
export const codeService = {
  getTemplates: async () => {
    const response = await api.get('/code/templates');
    return response.data;
  },
  generate: async (templateId: string, customization: any) => {
    const response = await api.post('/code/generate', { templateId, customization });
    return response.data;
  },
  preview: async (code: string) => {
    const response = await api.post('/code/preview', { code });
    return response.data;
  }
};

// Analytics API
export const analyticsService = {
  getMetrics: async () => {
    const response = await api.get('/analytics/metrics');
    return response.data;
  },
  getGrowth: async () => {
    const response = await api.get('/analytics/growth');
    return response.data;
  },
  getUserStats: async () => {
    const response = await api.get('/analytics/users');
    return response.data;
  }
};

// Subscription API
export const subscriptionService = {
  create: async (plan: string) => {
    const response = await api.post('/subscriptions/create', { plan });
    return response.data;
  },
  update: async (id: string, data: any) => {
    const response = await api.put(`/subscriptions/${id}`, data);
    return response.data;
  },
  getStatus: async () => {
    const response = await api.get('/subscriptions/status');
    return response.data;
  }
};