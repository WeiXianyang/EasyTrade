import { Navigate, useLocation } from 'react-router-dom';

import { useApp } from '../contexts/useApp.js';

export function RequireUser({ children }) {
  const { currentUser } = useApp();
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}

export function RequireAdmin({ moduleName, children }) {
  const { canAccessAdminModule, currentAdmin } = useApp();

  if (!currentAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  if (moduleName && !canAccessAdminModule(moduleName)) {
    return <Navigate to="/admin" replace />;
  }

  return children;
}
