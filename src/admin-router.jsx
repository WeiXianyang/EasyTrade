/* eslint-disable react-refresh/only-export-components */
import { Suspense, lazy } from 'react';
import { createHashRouter, Navigate } from 'react-router-dom';

import App from './App';
import { RequireAdmin } from './components/RouteGuards.jsx';
import PageSkeleton from './components/shop/PageSkeleton.jsx';

const AdminLayout = lazy(() => import('./layouts/AdminLayout.jsx'));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage.jsx'));
const AdminCategoriesPage = lazy(() => import('./pages/admin/AdminCategoriesPage.jsx'));
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage.jsx'));
const AdminOrdersPage = lazy(() => import('./pages/admin/AdminOrdersPage.jsx'));
const AdminProductsPage = lazy(() => import('./pages/admin/AdminProductsPage.jsx'));
const AdminRolesPage = lazy(() => import('./pages/admin/AdminRolesPage.jsx'));

const AdminLoader = <PageSkeleton />;

const adminLogin = (
  <Suspense fallback={AdminLoader}>
    <AdminLoginPage dashboardPath="/dashboard" shopUrl="/" />
  </Suspense>
);

const adminRouter = createHashRouter([
  {
    path: '/',
    Component: App,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'login', element: adminLogin },
      { path: 'admin', element: <Navigate to="/dashboard" replace /> },
      { path: 'admin/login', element: adminLogin },
      {
        element: (
          <RequireAdmin>
            <Suspense fallback={AdminLoader}>
              <AdminLayout basePath="" shopUrl="/" />
            </Suspense>
          </RequireAdmin>
        ),
        children: [
          { path: 'dashboard', element: <Suspense fallback={AdminLoader}><AdminDashboardPage /></Suspense> },
          {
            path: 'products',
            element: (
              <RequireAdmin moduleName="products">
                <Suspense fallback={AdminLoader}><AdminProductsPage /></Suspense>
              </RequireAdmin>
            ),
          },
          {
            path: 'categories',
            element: (
              <RequireAdmin moduleName="categories">
                <Suspense fallback={AdminLoader}><AdminCategoriesPage /></Suspense>
              </RequireAdmin>
            ),
          },
          {
            path: 'orders',
            element: (
              <RequireAdmin moduleName="orders">
                <Suspense fallback={AdminLoader}><AdminOrdersPage /></Suspense>
              </RequireAdmin>
            ),
          },
          {
            path: 'roles',
            element: (
              <RequireAdmin moduleName="roles">
                <Suspense fallback={AdminLoader}><AdminRolesPage /></Suspense>
              </RequireAdmin>
            ),
          },
        ],
      },
    ],
  },
]);

export default adminRouter;
