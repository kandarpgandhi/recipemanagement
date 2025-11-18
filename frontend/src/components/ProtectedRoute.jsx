import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (adminOnly && !user.isAdmin) return <div style={{ padding: 20 }}>Access denied</div>;
  return children;
}
