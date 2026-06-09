/* eslint-disable react-refresh/only-export-components */
import { Suspense, lazy } from 'react';
import { Spin } from 'antd';
import { createBrowserRouter } from 'react-router-dom';

import App from './App';
import { RequireAdmin, RequireUser } from './components/RouteGuards.jsx';

// ─── 懒加载所有页面组件（代码分割，减小首屏包体积）─────────────────────────────
const AdminLayout        = lazy(() => import('./layouts/AdminLayout.jsx'));
const ShopLayout         = lazy(() => import('./layouts/ShopLayout.jsx'));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage.jsx'));
const AdminCategoriesPage= lazy(() => import('./pages/admin/AdminCategoriesPage.jsx'));
const AdminLoginPage     = lazy(() => import('./pages/admin/AdminLoginPage.jsx'));
const AdminOrdersPage    = lazy(() => import('./pages/admin/AdminOrdersPage.jsx'));
const AdminProductsPage  = lazy(() => import('./pages/admin/AdminProductsPage.jsx'));
const AdminRolesPage     = lazy(() => import('./pages/admin/AdminRolesPage.jsx'));
const CartPage           = lazy(() => import('./pages/CartPage.jsx'));
const CategoryPage       = lazy(() => import('./pages/CategoryPage.jsx'));
const CheckoutPage       = lazy(() => import('./pages/CheckoutPage.jsx'));
const HomePage           = lazy(() => import('./pages/HomePage.jsx'));
const LoginPage          = lazy(() => import('./pages/LoginPage.jsx'));
const MePage             = lazy(() => import('./pages/MePage.jsx'));
const NotFoundPage       = lazy(() => import('./pages/NotFoundPage.jsx'));
const OrderDetailPage    = lazy(() => import('./pages/OrderDetailPage.jsx'));
const OrderListPage      = lazy(() => import('./pages/OrderListPage.jsx'));
const PayPage            = lazy(() => import('./pages/PayPage.jsx'));
const ProductDetailPage  = lazy(() => import('./pages/ProductDetailPage.jsx'));

/** 路由级全局 Loading 占位 */
const PageLoader = (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
    <Spin size="large" description="加载中..." />
  </div>
);

const router = createBrowserRouter([
  {
    path: '/',
    Component: App,
    children: [
      {
        // 前台布局，所有前台页面共享 ShopLayout
        element: (
          <Suspense fallback={PageLoader}>
            <ShopLayout />
          </Suspense>
        ),
        children: [
          { index: true, element: <Suspense fallback={PageLoader}><HomePage /></Suspense> },
          { path: 'category',         element: <Suspense fallback={PageLoader}><CategoryPage /></Suspense> },
          { path: 'login',            element: <Suspense fallback={PageLoader}><LoginPage /></Suspense> },
          { path: 'detail/:productId',element: <Suspense fallback={PageLoader}><ProductDetailPage /></Suspense> },
          {
            path: 'cart',
            element: (
              <RequireUser>
                <Suspense fallback={PageLoader}><CartPage /></Suspense>
              </RequireUser>
            ),
          },
          {
            path: 'checkout',
            element: (
              <RequireUser>
                <Suspense fallback={PageLoader}><CheckoutPage /></Suspense>
              </RequireUser>
            ),
          },
          {
            path: 'pay/:orderId',
            element: (
              <RequireUser>
                <Suspense fallback={PageLoader}><PayPage /></Suspense>
              </RequireUser>
            ),
          },
          {
            path: 'orders',
            element: (
              <RequireUser>
                <Suspense fallback={PageLoader}><OrderListPage /></Suspense>
              </RequireUser>
            ),
          },
          {
            path: 'orders/:orderId',
            element: (
              <RequireUser>
                <Suspense fallback={PageLoader}><OrderDetailPage /></Suspense>
              </RequireUser>
            ),
          },
          {
            path: 'me',
            element: (
              <RequireUser>
                <Suspense fallback={PageLoader}><MePage /></Suspense>
              </RequireUser>
            ),
          },
        ],
      },
      {
        // 后台登录（独立页，不在 AdminLayout 内）
        path: 'admin/login',
        element: <Suspense fallback={PageLoader}><AdminLoginPage /></Suspense>,
      },
      {
        // 后台布局
        path: 'admin',
        element: (
          <RequireAdmin>
            <Suspense fallback={PageLoader}><AdminLayout /></Suspense>
          </RequireAdmin>
        ),
        children: [
          { index: true, element: <Suspense fallback={PageLoader}><AdminDashboardPage /></Suspense> },
          {
            path: 'products',
            element: (
              <RequireAdmin moduleName="products">
                <Suspense fallback={PageLoader}><AdminProductsPage /></Suspense>
              </RequireAdmin>
            ),
          },
          {
            path: 'categories',
            element: (
              <RequireAdmin moduleName="categories">
                <Suspense fallback={PageLoader}><AdminCategoriesPage /></Suspense>
              </RequireAdmin>
            ),
          },
          {
            path: 'orders',
            element: (
              <RequireAdmin moduleName="orders">
                <Suspense fallback={PageLoader}><AdminOrdersPage /></Suspense>
              </RequireAdmin>
            ),
          },
          {
            path: 'roles',
            element: (
              <RequireAdmin moduleName="roles">
                <Suspense fallback={PageLoader}><AdminRolesPage /></Suspense>
              </RequireAdmin>
            ),
          },
        ],
      },
      // 404 — 捕获所有未匹配路由
      {
        path: '*',
        element: <Suspense fallback={PageLoader}><NotFoundPage /></Suspense>,
      },
    ],
  },
]);

export default router;
