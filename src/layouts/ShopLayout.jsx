import { Badge, Button, Checkbox, Drawer, Empty, Flex, Image, InputNumber, Layout, Space, Tooltip, Typography } from 'antd';
import { useCallback, useEffect, useReducer, useState } from 'react';
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
import LogoutBtn from '../components/shop/LogoutBtn.jsx';
import FloatingSupportBtn from '../components/shop/FloatingSupportBtn.jsx';
import SupportDrawer from '../components/shop/SupportDrawer.jsx';
import './ShopBottomNav.css';

const navItems = [
  { key: '/', to: '/', icon: <HomeOutlined />, label: '首页' },
  { key: '/cart', to: '/cart', icon: <ShoppingCartOutlined />, label: '购物车', badge: true },
  { key: '/category', to: '/category', icon: <AppstoreOutlined />, label: '分类' },
  { key: '/me', to: '/me', icon: <UserOutlined />, label: '我的' },
];

function hasQuantityDraft(quantityDrafts, productId) {
  return Object.prototype.hasOwnProperty.call(quantityDrafts, productId);
}

function isCommitableQuantity(quantity) {
  return quantity !== null && quantity !== undefined && quantity !== '';
}

function selectedKey(pathname) {
  if (pathname.startsWith('/category')) return '/category';
  if (pathname.startsWith('/cart') || pathname.startsWith('/checkout') || pathname.startsWith('/pay')) return '/cart';
  if (pathname.startsWith('/me') || pathname.startsWith('/orders')) return '/me';
  return '/';
}

export default function ShopLayout() {
  const location = useLocation();

  const [headerHidden, setHeaderHidden] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
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
  const currentUserId = currentUser?.id;
  const activeKey = selectedKey(location.pathname);

  // 本地 state 持有购物车快照，Drawer 打开时强制刷新
  const [localVersion, forceUpdate] = useReducer((n) => n + 1, 0);
  const [quantityDrafts, setQuantityDrafts] = useState({});

  useEffect(() => {
    if (cartDrawerOpen) {
      forceUpdate(); // Drawer 每次打开时重新从 localStorage 读取
    }
  }, [cartDrawerOpen]);

  const cartItems = currentUserId ? cartService.getCart(currentUserId) : [];
  const cartSummary = currentUserId ? cartService.getSelectedSummary(currentUserId) : { count: 0, total: 0 };
  const hasSelectedCartItems = cartItems.some((item) => item.selected);
  const allCartItemsSelected = cartItems.length > 0 && cartItems.every((item) => item.selected);
  const partiallySelectedCartItems = hasSelectedCartItems && !allCartItemsSelected;
  void localVersion; // 消费 localVersion，使上方两行在 forceUpdate 后重新执行

  const updateCart = useCallback((action) => {
    action();
    refresh();
    forceUpdate(); // Drawer 内操作（删除/改数量）后立即刷新列表
  }, [refresh]);

  const resetQuantityDraft = useCallback((productId) => {
    setQuantityDrafts((previous) => {
      if (!hasQuantityDraft(previous, productId)) return previous;
      const next = { ...previous };
      delete next[productId];
      return next;
    });
  }, []);

  const commitQuantity = useCallback((productId, quantity) => {
    if (!currentUserId || !isCommitableQuantity(quantity)) return;
    updateCart(() => cartService.updateQuantity(currentUserId, productId, quantity));
    resetQuantityDraft(productId);
  }, [currentUserId, resetQuantityDraft, updateCart]);

  const updateQuantity = useCallback((productId, quantity) => {
    setQuantityDrafts((previous) => ({ ...previous, [productId]: quantity }));
    commitQuantity(productId, quantity);
  }, [commitQuantity]);

  const getQuantityValue = useCallback((item) => (
    hasQuantityDraft(quantityDrafts, item.productId) ? quantityDrafts[item.productId] : item.quantity
  ), [quantityDrafts]);

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
                  className="theme-toggle-btn"
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
                <span className="shop-bottom-nav-label">{item.label}</span>
              </Badge>
            ) : (
              <span className="shop-bottom-nav-label">{item.label}</span>
            )}
          </Link>
        ))}
      </nav>
      <div className="shop-floating-support">
        <FloatingSupportBtn onClick={() => setSupportOpen(true)} />
      </div>
      <SupportDrawer open={supportOpen} onClose={() => setSupportOpen(false)} />
      <Drawer
        className="cart-drawer"
        title="购物车"
        open={cartDrawerOpen}
        onClose={closeCart}
        afterOpenChange={(open) => {
          if (!open) setQuantityDrafts({});
        }}
        size="default"
        footer={
          currentUser && cartItems.length > 0 ? (
            <div className="cart-drawer-footer">
              <div>
                <Typography.Text className="muted cart-summary-text">已选 {cartSummary.count} 件</Typography.Text>
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
            <Flex justify="space-between" align="center" className="cart-drawer-select-bar">
              <Checkbox
                checked={allCartItemsSelected}
                indeterminate={partiallySelectedCartItems}
                onChange={(event) => updateCart(() => cartService.setAllSelected(currentUserId, event.target.checked))}
              >
                全选
              </Checkbox>
              <Button
                size="small"
                disabled={!hasSelectedCartItems}
                onClick={() => updateCart(() => cartService.setAllSelected(currentUserId, false))}
              >
                取消全选
              </Button>
            </Flex>
            {cartItems.map((item) => (
              <Flex key={item.productId} align="center" gap={12} className="cart-drawer-item">
                <Checkbox
                  aria-label={`选择 ${item.product.name}`}
                  checked={item.selected}
                  onChange={(event) => updateCart(() => cartService.setSelected(currentUserId, item.productId, event.target.checked))}
                />
                <Image width={56} height={42} src={item.product.image} alt={item.product.name} style={{ objectFit: 'cover', borderRadius: 8 }} />
                <Flex vertical flex={1} gap={4}>
                  <Typography.Text className="cart-drawer-name" ellipsis>{item.product.name}</Typography.Text>
                  <Typography.Text className="price cart-drawer-price">{formatCurrency(item.product.price)}</Typography.Text>
                  <Flex align="center" gap={8}>
                    <InputNumber
                      className="cart-drawer-qty"
                      min={1}
                      max={item.product.stock}
                      value={getQuantityValue(item)}
                      onChange={(value) => updateQuantity(item.productId, value)}
                      onBlur={() => resetQuantityDraft(item.productId)}
                    />
                    <Button
                      danger
                      type="text"
                      icon={<DeleteOutlined />}
                      onClick={() => {
                        resetQuantityDraft(item.productId);
                        updateCart(() => cartService.removeItem(currentUserId, item.productId));
                      }}
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
