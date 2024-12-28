import { useAuth } from '@renderer/context/authContext';
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
// import { useAuth } from './context/authContext';

interface ProtectedRouteProps {
  children: JSX.Element;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { token } = useAuth();
  const location = useLocation();

  // If no token is available, redirect to login
  if (!token) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Otherwise, render the children components
  return children;
};

export default ProtectedRoute;
