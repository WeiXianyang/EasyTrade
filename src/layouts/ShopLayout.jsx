import { Badge, Button, Drawer, Empty, Flex, Image, InputNumber, Layout, Space, Tooltip, Typography } from 'antd';
import { useEffect, useReducer, useState } from 'react';
import {
  AppstoreOutlined,
  DeleteOutlined,
  HomeOutlined,
  LoginOutlined,
  MoonOutlined,
  ShoppingCartOutlined,
  SunOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';

import { useApp } from '../contexts/useApp.js';
import cartService from '../services/cartService.js';
import { formatCurrency } from '../utils/format.js';
import './ShopBottomNav.css'; 
import LogoutBtn from '../components/shop/LogoutBtn.jsx';

const navItems = [
  { key: '/', to: '/', icon: <HomeOutlined />, label: '首页' },
  { key: '/category', to: '/category', icon: <AppstoreOutlined />, label: '分类' },
  { key: '/cart', to: '/cart', icon: <ShoppingCartOutlined />, label: '购物车', badge: true },
  { key: '/me', to: '/me', icon: <UserOutlined />, label: '我的' },
];

function selectedKey(pathname) {
  if (pathname.startsWith('/category')) return '/category';
  if (pathname.startsWith('/cart') || pathname.startsWith('/checkout') || pathname.startsWith('/pay')) return '/cart';
  if (pathname.startsWith('/me') || pathname.startsWith('/orders')) return '/me';
  return '/';
}

function FloatingSupportBtn() {
  return null;
}

function SupportDrawer() {
  return null;
}

export default function ShopLayout() {
  const location = useLocation();

  const [headerHidden, setHeaderHidden] = useState(false);
  useEffect(()=>{
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if(currentScrollY > 30 && lastScrollY < currentScrollY) {
        setHeaderHidden(true);
      }
      else{
        setHeaderHidden(false);
      }
    };
    window.addEventListener('scroll', handleScroll, {passive: true});
    return () => window.removeEventListener('scroll', handleScroll);
    
  }, []);
  const navigate = useNavigate();
  const { cartCount, cartDrawerOpen, closeCart, currentUser, logoutUser, refresh, theme, toggleTheme } = useApp();
  const activeKey = selectedKey(location.pathname);

  // 本地 state 持有购物车快照，Drawer 打开时强制刷新
  const [localVersion, forceUpdate] = useReducer((n) => n + 1, 0);

  useEffect(() => {
    if (cartDrawerOpen) {
      forceUpdate(); // Drawer 每次打开时重新从 localStorage 读取
    }
  }, [cartDrawerOpen]);

  const cartItems = currentUser ? cartService.getCart(currentUser.id) : [];
  const cartSummary = currentUser ? cartService.getSelectedSummary(currentUser.id) : { count: 0, total: 0 };
  void localVersion; // 消费 localVersion，使上方两行在 forceUpdate 后重新执行

  const updateCart = (action) => {
    action();
    refresh();
    forceUpdate(); // Drawer 内操作（删除/改数量）后立即刷新列表
  };

  const goCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  return (
    <Layout className="shop-layout">
      <Layout.Header className={`shop-header${headerHidden ? ' hidden' : ''}`}>
        <div className="shop-header-inner">
          <div className="shop-header-main">
            <Link className="brand" to="/">
              <span className="brand-mark"></span>
              <span>EasyTrade</span>
            </Link>
            <Space>
              {/* 主题切换按钮 */}
              <Tooltip title={theme === 'light' ? '切换暗色' : '切换亮色'}>
                <Button
                  type="text"
                  icon={theme === 'light' ? <MoonOutlined /> : <SunOutlined />}
                  onClick={toggleTheme}
                  aria-label="切换主题"
                />
              </Tooltip>
              {currentUser ? (
                <>
                  <span className="muted">{currentUser.name}</span>
                  <LogoutBtn onClick={logoutUser}/>
                </>
              ) : (
                <Button icon={<LoginOutlined />} type="primary" onClick={() => navigate('/login')}>
                  登录
                </Button>
              )}
            </Space>
          </div>
        </div>
      </Layout.Header>
      <Layout.Content className="shop-content">
        <Outlet />
      </Layout.Content>
      <Layout.Footer className="shop-footer">
        EasyTrade React 商城系统 · localStorage 前后台联动 · Ant Design 主题覆写
      </Layout.Footer>
      <nav className="shop-bottom-nav" aria-label="主导航">
        {navItems.map((item) => (
          <Link key={item.key} className={`shop-bottom-nav-item${activeKey === item.key ? ' active' : ''}`} to={item.to}>
            {item.icon}
            {item.badge ? (
              <Badge count={cartCount} size="small">
                <span>{item.label}</span>
              </Badge>
            ) : (
              <span>{item.label}</span>
            )}
          </Link>
        ))}
      </nav>
      <div className="shop-floating-support-slot">
        <FloatingSupportBtn />
      </div>
      <SupportDrawer />
      <Drawer
        title="购物车"
        open={cartDrawerOpen}
        onClose={closeCart}
        size="default"
        footer={
          currentUser && cartItems.length > 0 ? (
            <div className="cart-drawer-footer">
              <div>
                <Typography.Text className="muted">已选 {cartSummary.count} 件</Typography.Text>
                <Typography.Title level={4} className="cart-total-price">
                  {formatCurrency(cartSummary.total)}
                </Typography.Title>
              </div>
              <Space>
                <Button onClick={() => {
                  closeCart();
                  navigate('/cart');
                }}>
                  购物车页
                </Button>
                <Button type="primary" disabled={cartSummary.count === 0} onClick={goCheckout}>
                  去结算
                </Button>
              </Space>
            </div>
          ) : null
        }
      >
        {!currentUser ? (
          <Empty description="登录后查看购物车">
            <Button type="primary" onClick={() => {
              closeCart();
              navigate('/login');
            }}>
              去登录
            </Button>
          </Empty>
        ) : cartItems.length === 0 ? (
          <Empty description="购物车还是空的">
            <Button type="primary" onClick={() => {
              closeCart();
              navigate('/category');
            }}>
              去逛逛
            </Button>
          </Empty>
        ) : (
          <div className="cart-drawer-list">
            {cartItems.map((item) => (
              <Flex key={item.productId} align="center" gap={12} className="cart-drawer-item">
                <Image width={56} height={42} src={item.product.image} alt={item.product.name} style={{ objectFit: 'cover', borderRadius: 8 }} />
                <Flex vertical flex={1} gap={4}>
                  <Typography.Text ellipsis>{item.product.name}</Typography.Text>
                  <Typography.Text className="price">{formatCurrency(item.product.price)}</Typography.Text>
                  <Flex align="center" gap={8}>
                    <InputNumber
                      min={1}
                      max={item.product.stock}
                      value={item.quantity}
                      onChange={(value) => updateCart(() => cartService.updateQuantity(currentUser.id, item.productId, value))}
                    />
                    <Button
                      danger
                      type="text"
                      icon={<DeleteOutlined />}
                      onClick={() => updateCart(() => cartService.removeItem(currentUser.id, item.productId))}
                    />
                  </Flex>
                </Flex>
              </Flex>
            ))}
          </div>
        )}
      </Drawer>
    </Layout>
  );
}
