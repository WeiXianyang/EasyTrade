import { useCallback, useEffect, useMemo, useState } from 'react';
import { App as AntApp, ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';

import easytradeApi, { cacheSession, clearSession } from '../api/easytradeApi.js';
import {
  ADMIN_STORAGE_KEY,
  TOKEN_STORAGE_KEY,
  USER_STORAGE_KEY,
  getStoredToken,
  storeAuthToken,
} from '../api/request.js';
import { rolePermissions as defaultRolePermissions } from '../services/permissionService.js';
import { lightTheme, darkTheme } from '../theme/easyTradeTheme.js';
import { AppContext } from './appContext.js';

function readJson(key) {
  const raw = globalThis.localStorage?.getItem(key);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw);
  } catch {
    globalThis.localStorage?.removeItem(key);
    return null;
  }
}

function writeJson(key, value) {
  globalThis.localStorage?.setItem(key, JSON.stringify(value));
}

function emptyCartSummary() {
  return { count: 0, total: 0 };
}

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => readJson(USER_STORAGE_KEY));
  const [currentAdmin, setCurrentAdmin] = useState(() => readJson(ADMIN_STORAGE_KEY));
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [cartSummary, setCartSummary] = useState(emptyCartSummary);
  const [rolePermissions, setRolePermissions] = useState(defaultRolePermissions);
  const [version, setVersion] = useState(0);
  const [theme, setTheme] = useState(
    () => globalThis.localStorage?.getItem('easytrade_theme') || 'light',
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    globalThis.localStorage?.setItem('easytrade_theme', theme);
  }, [theme]);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      return undefined;
    }

    let cancelled = false;
    easytradeApi.auth.me()
      .then((user) => {
        if (cancelled) return;
        if (user.role === 'customer') {
          setCurrentUser(user);
          setCurrentAdmin(null);
          writeJson(USER_STORAGE_KEY, user);
          globalThis.localStorage?.removeItem(ADMIN_STORAGE_KEY);
        } else {
          setCurrentAdmin(user);
          setCurrentUser(null);
          writeJson(ADMIN_STORAGE_KEY, user);
          globalThis.localStorage?.removeItem(USER_STORAGE_KEY);
        }
      })
      .catch(() => {
        if (cancelled) return;
        clearSession();
        setCurrentUser(null);
        setCurrentAdmin(null);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const reloadCart = useCallback(async () => {
    if (!currentUser) {
      setCartItems([]);
      setCartSummary(emptyCartSummary());
      return [];
    }

    try {
      const [items, summary] = await Promise.all([
        easytradeApi.cart.list(),
        easytradeApi.cart.summary(),
      ]);
      setCartItems(items || []);
      setCartSummary(summary || emptyCartSummary());
      return items || [];
    } catch {
      setCartItems([]);
      setCartSummary(emptyCartSummary());
      return [];
    }
  }, [currentUser]);

  const reloadPermissions = useCallback(async () => {
    if (!currentAdmin) {
      setRolePermissions(defaultRolePermissions);
      return defaultRolePermissions;
    }
    try {
      const result = await easytradeApi.admin.permissions();
      const permissions = result?.permissions || defaultRolePermissions;
      setRolePermissions(permissions);
      return permissions;
    } catch {
      setRolePermissions(defaultRolePermissions);
      return defaultRolePermissions;
    }
  }, [currentAdmin]);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(async () => {
      if (!active) return;
      if (!currentUser) {
        setCartItems([]);
        setCartSummary(emptyCartSummary());
        return;
      }
      try {
        const [items, summary] = await Promise.all([
          easytradeApi.cart.list(),
          easytradeApi.cart.summary(),
        ]);
        if (!active) return;
        setCartItems(items || []);
        setCartSummary(summary || emptyCartSummary());
      } catch {
        if (!active) return;
        setCartItems([]);
        setCartSummary(emptyCartSummary());
      }
    });
    return () => {
      active = false;
    };
  }, [currentUser, version]);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(async () => {
      if (!active) return;
      if (!currentAdmin) {
        setRolePermissions(defaultRolePermissions);
        return;
      }
      try {
        const result = await easytradeApi.admin.permissions();
        if (active) setRolePermissions(result?.permissions || defaultRolePermissions);
      } catch {
        if (active) setRolePermissions(defaultRolePermissions);
      }
    });
    return () => {
      active = false;
    };
  }, [currentAdmin, version]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const refresh = useCallback(() => {
    setVersion((v) => v + 1);
    return reloadCart();
  }, [reloadCart]);

  const openCart = useCallback(() => setCartDrawerOpen(true), []);
  const closeCart = useCallback(() => setCartDrawerOpen(false), []);

  const loginUser = useCallback(async (identifier, password) => {
    const session = await easytradeApi.auth.login(identifier, password);
    setCurrentUser(session.user);
    setCurrentAdmin(null);
    globalThis.localStorage?.removeItem(ADMIN_STORAGE_KEY);
    setVersion((v) => v + 1);
    return session.user;
  }, []);

  const registerUser = useCallback(async (values) => {
    const session = await easytradeApi.auth.register(values);
    setCurrentUser(session.user);
    setCurrentAdmin(null);
    globalThis.localStorage?.removeItem(ADMIN_STORAGE_KEY);
    setVersion((v) => v + 1);
    return session.user;
  }, []);

  const sendLoginCode = useCallback((phone) => easytradeApi.auth.sendCode(phone), []);

  const loginByCode = useCallback(async (phone, code) => {
    const session = await easytradeApi.auth.codeLogin(phone, code);
    setCurrentUser(session.user);
    setCurrentAdmin(null);
    globalThis.localStorage?.removeItem(ADMIN_STORAGE_KEY);
    setVersion((v) => v + 1);
    return session.user;
  }, []);

  const logoutUser = useCallback(() => {
    clearSession();
    setCurrentUser(null);
    setCurrentAdmin(null);
    setCartItems([]);
    setCartSummary(emptyCartSummary());
    setVersion((v) => v + 1);
  }, []);

  const loginAdmin = useCallback(async (identifier, password) => {
    const session = await easytradeApi.auth.adminLogin(identifier, password);
    setCurrentAdmin(session.user);
    setCurrentUser(null);
    globalThis.localStorage?.removeItem(USER_STORAGE_KEY);
    setVersion((v) => v + 1);
    return { ...session.user, token: session.token };
  }, []);

  const acceptAdminHandoff = useCallback((payload) => {
    const acceptedAdmin = payload?.user || payload;
    if (!acceptedAdmin?.id || !acceptedAdmin?.username || !['admin', 'operator'].includes(acceptedAdmin.role)) {
      throw new Error('无效的后台身份');
    }
    if (payload?.token) {
      storeAuthToken(payload.token);
      globalThis.localStorage?.setItem(TOKEN_STORAGE_KEY, payload.token);
    }
    cacheSession({ token: payload?.token || getStoredToken(), user: acceptedAdmin }, ADMIN_STORAGE_KEY);
    setCurrentAdmin(acceptedAdmin);
    setCurrentUser(null);
    globalThis.localStorage?.removeItem(USER_STORAGE_KEY);
    setVersion((v) => v + 1);
    return acceptedAdmin;
  }, []);

  const logoutAdmin = useCallback(() => {
    clearSession();
    setCurrentUser(null);
    setCurrentAdmin(null);
    setVersion((v) => v + 1);
  }, []);

  const canAccessAdminModule = useCallback((moduleName) => {
    if (!moduleName || !currentAdmin) {
      return Boolean(currentAdmin);
    }
    if (currentAdmin.role === 'admin' && ['dashboard', 'roles'].includes(moduleName)) {
      return true;
    }
    return Boolean(rolePermissions[currentAdmin.role]?.includes(moduleName));
  }, [currentAdmin, rolePermissions]);

  const value = useMemo(() => ({
    currentUser,
    currentAdmin,
    cartCount: cartSummary.count,
    cartItems,
    cartSummary,
    cartDrawerOpen,
    rolePermissions,
    version,
    theme,
    toggleTheme,
    refresh,
    refreshCart: reloadCart,
    reloadPermissions,
    canAccessAdminModule,
    openCart,
    closeCart,
    loginUser,
    registerUser,
    sendLoginCode,
    loginByCode,
    logoutUser,
    loginAdmin,
    acceptAdminHandoff,
    logoutAdmin,
  }), [
    currentUser,
    currentAdmin,
    cartSummary,
    cartItems,
    cartDrawerOpen,
    rolePermissions,
    version,
    theme,
    toggleTheme,
    refresh,
    reloadCart,
    reloadPermissions,
    openCart,
    closeCart,
    loginUser,
    registerUser,
    sendLoginCode,
    loginByCode,
    logoutUser,
    loginAdmin,
    acceptAdminHandoff,
    logoutAdmin,
    canAccessAdminModule,
  ]);

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
