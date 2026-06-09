import { useCallback, useEffect, useMemo, useState } from 'react';
import { App as AntApp, ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';

import authService from '../services/authService.js';
import cartService from '../services/cartService.js';
import { lightTheme, darkTheme } from '../theme/easyTradeTheme.js';
import { AppContext } from './appContext.js';

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => authService.getCurrentUser());
  const [currentAdmin, setCurrentAdmin] = useState(() => authService.getCurrentAdmin());
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [version, setVersion] = useState(0);

  // ─── 主题状态（明/暗，持久化到 localStorage）────────────────────────────────
  const [theme, setTheme] = useState(
    () => localStorage.getItem('easytrade_theme') || 'light',
  );

  /**
   * 切换主题：将 data-theme 属性写到 <html> 根节点，
   * theme.css 中通过 [data-theme="dark"] 选择器覆盖 CSS 变量
   */
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('easytrade_theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const refresh = useCallback(() => {
    setVersion((v) => v + 1);
  }, []);

  const { cartItems, cartSummary } = useMemo(() => {
    void version;
    return {
      cartItems: currentUser ? cartService.getCart(currentUser.id) : [],
      cartSummary: currentUser ? cartService.getSelectedSummary(currentUser.id) : { count: 0, total: 0 },
    };
  }, [currentUser, version]);
  const cartCount = cartSummary.count;

  const openCart = useCallback(() => setCartDrawerOpen(true), []);
  const closeCart = useCallback(() => setCartDrawerOpen(false), []);
  const loginUser = useCallback((identifier, password) => {
    const user = authService.loginUser(identifier, password);
    setCurrentUser(user);
    setVersion((v) => v + 1);
    return user;
  }, []);
  const registerUser = useCallback((values) => {
    const user = authService.registerUser(values);
    setCurrentUser(user);
    setVersion((v) => v + 1);
    return user;
  }, []);
  const logoutUser = useCallback(() => {
    authService.logoutUser();
    setCurrentUser(null);
    setVersion((v) => v + 1);
  }, []);
  const loginAdmin = useCallback((identifier, password) => {
    const admin = authService.loginAdmin(identifier, password);
    setCurrentAdmin(admin);
    setVersion((v) => v + 1);
    return admin;
  }, []);
  const logoutAdmin = useCallback(() => {
    authService.logoutAdmin();
    setCurrentAdmin(null);
    setVersion((v) => v + 1);
  }, []);

  const value = useMemo(() => ({
    currentUser,
    currentAdmin,
    cartCount,
    cartItems,
    cartSummary,
    cartDrawerOpen,
    version,
    theme,
    toggleTheme,
    refresh,
    refreshCart: refresh,
    openCart,
    closeCart,
    loginUser,
    registerUser,
    logoutUser,
    loginAdmin,
    logoutAdmin,
  }), [currentUser, currentAdmin, cartCount, cartItems, cartSummary, cartDrawerOpen, version, theme, toggleTheme, refresh, openCart, closeCart, loginUser, registerUser, logoutUser, loginAdmin, logoutAdmin]);

  const antdTheme = theme === 'dark' ? darkTheme : lightTheme;

  return (
    <AppContext.Provider value={value}>
      <ConfigProvider locale={zhCN} theme={antdTheme}>
        <AntApp>
          {children}
        </AntApp>
      </ConfigProvider>
    </AppContext.Provider>
  );
}
