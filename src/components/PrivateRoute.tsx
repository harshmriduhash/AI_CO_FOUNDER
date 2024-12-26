import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface PrivateRouteProps {
  children: React.ReactNode;
}

function PrivateRoute({ children }: PrivateRouteProps) {
  const { isAuthenticated, subscription } = useAuthStore();
  const location = useLocation();

  // Redirect to pricing if no active subscription
  if (isAuthenticated && !subscription) {
    return <Navigate to="/#pricing" state={{ from: location }} replace />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

export default PrivateRoute;