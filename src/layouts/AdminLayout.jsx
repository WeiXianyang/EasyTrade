import { Button, Layout, Menu, Space } from 'antd';
import {
  AppstoreOutlined,
  DashboardOutlined,
  LogoutOutlined,
  ProductOutlined,
  ShopOutlined,
  ShoppingOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import { useApp } from '../contexts/useApp.js';
import { canAccess, getRoleLabel } from '../services/permissionService.js';

const allItems = [
  { key: '/admin', icon: <DashboardOutlined />, label: '概览', moduleName: 'dashboard' },
  { key: '/admin/products', icon: <ProductOutlined />, label: '商品管理', moduleName: 'products' },
  { key: '/admin/categories', icon: <AppstoreOutlined />, label: '分类管理', moduleName: 'categories' },
  { key: '/admin/orders', icon: <ShoppingOutlined />, label: '订单管理', moduleName: 'orders' },
  { key: '/admin/roles', icon: <TeamOutlined />, label: '权限管理', moduleName: 'roles' },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentAdmin, logoutAdmin } = useApp();
  const items = allItems
    .filter((item) => canAccess(currentAdmin.role, item.moduleName))
    .map((item) => ({ key: item.key, icon: item.icon, label: item.label }));
  const selectedKey = [...items].reverse().find((item) => location.pathname === item.key)?.key || '/admin';

  return (
    <Layout className="admin-layout">
      <Layout.Sider breakpoint="lg" collapsedWidth="0">
        <div className="admin-logo">
          <span className="brand-mark">ET</span>
          <span>后台管理</span>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={items}
          onClick={({ key }) => navigate(key)}
        />
      </Layout.Sider>
      <Layout>
        <Layout.Header className="admin-topbar">
          <Space>
            <span>{currentAdmin.name}</span>
            <span className="muted">{getRoleLabel(currentAdmin.role)}</span>
            <Button icon={<ShopOutlined />} onClick={() => navigate('/')}>
              返回商城
            </Button>
            <Button icon={<LogoutOutlined />} onClick={() => {
              logoutAdmin();
              navigate('/admin/login');
            }}>
              退出后台
            </Button>
          </Space>
        </Layout.Header>
        <Layout.Content className="admin-content">
          <Outlet />
        </Layout.Content>
      </Layout>
    </Layout>
  );
}
