import { Navigate, useLocation } from 'react-router-dom';

import { useApp } from '../contexts/useApp.js';
import { canAccess } from '../services/permissionService.js';

export function RequireUser({ children }) {
  const { currentUser } = useApp();
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}

export function RequireAdmin({ moduleName, children }) {
  const { currentAdmin } = useApp();

  if (!currentAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  if (moduleName && !canAccess(currentAdmin.role, moduleName)) {
    return <Navigate to="/admin" replace />;
  }

  return children;
}
