import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../services/api';

interface Subscription {
  id: string;
  plan: 'starter' | 'pro' | 'enterprise';
  status: 'active' | 'cancelled' | 'expired';
  expiresAt: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: {
    id: string;
    email: string;
    name: string;
  } | null;
  subscription: Subscription | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: Partial<AuthState['user']>) => void;
  updateSubscription: (subscription: Subscription) => void;
  setToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      subscription: null,
      token: null,
      login: async (email: string, password: string) => {
        try {
          const { token, user, subscription } = await authService.login(email, password);
          set({ 
            isAuthenticated: true,
            user,
            subscription,
            token
          });
          localStorage.setItem('auth_token', token);
        } catch (error) {
          throw new Error('Invalid credentials');
        }
      },
      signup: async (email: string, password: string, name: string) => {
        try {
          const { token, user, subscription } = await authService.signup(email, password, name);
          set({ 
            isAuthenticated: true,
            user,
            subscription,
            token
          });
          localStorage.setItem('auth_token', token);
        } catch (error) {
          throw new Error('Signup failed');
        }
      },
      logout: () => {
        localStorage.removeItem('auth_token');
        set({ 
          isAuthenticated: false, 
          user: null,
          subscription: null,
          token: null
        });
      },
      updateUser: (userData) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null
        }));
      },
      updateSubscription: (subscription) => {
        set({ subscription });
      },
      setToken: (token) => {
        set({ token });
        localStorage.setItem('auth_token', token);
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        subscription: state.subscription,
        token: state.token
      })
    }
  )
);

// Initialize token from localStorage
const token = localStorage.getItem('auth_token');
if (token) {
  useAuthStore.getState().setToken(token);
}