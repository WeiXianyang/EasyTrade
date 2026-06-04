import { createBrowserRouter } from "react-router-dom";

import App from './App';
import { RequireAdmin, RequireUser } from './components/RouteGuards.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';
import ShopLayout from './layouts/ShopLayout.jsx';
import AdminDashboardPage from './pages/admin/AdminDashboardPage.jsx';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage.jsx';
import AdminLoginPage from './pages/admin/AdminLoginPage.jsx';
import AdminOrdersPage from './pages/admin/AdminOrdersPage.jsx';
import AdminProductsPage from './pages/admin/AdminProductsPage.jsx';
import AdminRolesPage from './pages/admin/AdminRolesPage.jsx';
import CartPage from './pages/CartPage.jsx';
import CategoryPage from './pages/CategoryPage.jsx';
import CheckoutPage from './pages/CheckoutPage.jsx';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import MePage from './pages/MePage.jsx';
import OrderDetailPage from './pages/OrderDetailPage.jsx';
import OrderListPage from './pages/OrderListPage.jsx';
import PayPage from './pages/PayPage.jsx';
import ProductDetailPage from './pages/ProductDetailPage.jsx';

const router = createBrowserRouter([
  {
    path: "/",
    Component: App,
    children: [
      {
        Component: ShopLayout,
        children: [
          { index: true, Component: HomePage },
          { path: "home", Component: HomePage },
          { path: "category", Component: CategoryPage },
          { path: "login", Component: LoginPage },
          { path: "detail/:productId", Component: ProductDetailPage },
          {
            path: "cart",
            element: (
              <RequireUser>
                <CartPage />
              </RequireUser>
            ),
          },
          {
            path: "checkout",
            element: (
              <RequireUser>
                <CheckoutPage />
              </RequireUser>
            ),
          },
          {
            path: "pay/:orderId",
            element: (
              <RequireUser>
                <PayPage />
              </RequireUser>
            ),
          },
          {
            path: "orders",
            element: (
              <RequireUser>
                <OrderListPage />
              </RequireUser>
            ),
          },
          {
            path: "orders/:orderId",
            element: (
              <RequireUser>
                <OrderDetailPage />
              </RequireUser>
            ),
          },
          {
            path: "me",
            element: (
              <RequireUser>
                <MePage />
              </RequireUser>
            ),
          },
        ],
      },
      {
        path: "admin/login",
        Component: AdminLoginPage,
      },
      {
        path: "admin",
        element: (
          <RequireAdmin>
            <AdminLayout />
          </RequireAdmin>
        ),
        children: [
          { index: true, Component: AdminDashboardPage },
          {
            path: "products",
            element: (
              <RequireAdmin moduleName="products">
                <AdminProductsPage />
              </RequireAdmin>
            ),
          },
          {
            path: "categories",
            element: (
              <RequireAdmin moduleName="categories">
                <AdminCategoriesPage />
              </RequireAdmin>
            ),
          },
          {
            path: "orders",
            element: (
              <RequireAdmin moduleName="orders">
                <AdminOrdersPage />
              </RequireAdmin>
            ),
          },
          {
            path: "roles",
            element: (
              <RequireAdmin moduleName="roles">
                <AdminRolesPage />
              </RequireAdmin>
            ),
          },
        ],
      },
    ]
  }
]);

export default router;
