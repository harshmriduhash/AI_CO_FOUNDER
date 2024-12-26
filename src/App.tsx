import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import { useAuthStore } from './store/authStore';
import { Analytics } from "@vercel/analytics/react";

// Implement code splitting with lazy loading
const LandingPage = lazy(() => import('./pages/LandingPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const PaywallModal = lazy(() => import('./components/PaywallModal'));
const PrivateRoute = lazy(() => import('./components/PrivateRoute'));

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-black">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-blue-500">Loading...</p>
      </div>
    </div>
  );
}

// Subscription guard component
interface SubscriptionGuardProps {
  children: React.ReactNode;
}

function SubscriptionGuard({ children }: SubscriptionGuardProps) {
  const { subscription } = useAuthStore();
  
  if (!subscription || subscription.status !== 'active') {
    return <Navigate to="/subscribe" replace />;
  }
  
  return <>{children}</>;
}

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            
            {/* Subscription route */}
            <Route
              path="/subscribe"
              element={
                isAuthenticated ? (
                  <PaywallModal />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            
            {/* Protected dashboard routes */}
            <Route
              path="/dashboard/*"
              element={
                <PrivateRoute>
                  <SubscriptionGuard>
                    <Dashboard />
                  </SubscriptionGuard>
                </PrivateRoute>
              }
            />

            {/* Catch-all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
      <Analytics />
    </ErrorBoundary>
  );
}

export default App;