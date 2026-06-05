import { useCallback, useMemo, useState } from 'react';

import authService from '../services/authService.js';
import cartService from '../services/cartService.js';
import { AppContext } from './appContext.js';

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => authService.getCurrentUser());
  const [currentAdmin, setCurrentAdmin] = useState(() => authService.getCurrentAdmin());
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [version, setVersion] = useState(0);

  const refresh = useCallback(() => {
    setVersion((v) => v + 1);
  }, []);

  // 每次渲染时直接从 localStorage 读取最新数据，version 变化驱动重渲染
  const cartItems = currentUser ? cartService.getCart(currentUser.id) : [];
  const cartSummary = currentUser ? cartService.getSelectedSummary(currentUser.id) : { count: 0, total: 0 };
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
    refresh,
    refreshCart: refresh,
    openCart,
    closeCart,
    loginUser,
    registerUser,
    logoutUser,
    loginAdmin,
    logoutAdmin,
  }), [currentUser, currentAdmin, cartCount, cartItems, cartSummary, cartDrawerOpen, version, refresh, openCart, closeCart, loginUser, registerUser, logoutUser, loginAdmin, logoutAdmin]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
