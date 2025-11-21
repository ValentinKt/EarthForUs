import React from 'react';
import type { ReactElement } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { logger } from '../../../shared/utils/logger';

interface ProtectedRouteProps {
  children: ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const log = logger.withContext('ProtectedRoute');
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    log.warn('unauthorized_redirect', { to: '/login', from: location.pathname });
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  log.debug('authorized_access', { path: location.pathname });
  return children;
};

export default ProtectedRoute;
