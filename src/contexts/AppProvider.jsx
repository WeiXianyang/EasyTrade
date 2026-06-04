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
    setVersion((value) => value + 1);
  }, []);

  const cartCount = currentUser ? cartService.getSelectedSummary(currentUser.id).count : 0;

  const value = useMemo(
    () => ({
      currentUser,
      currentAdmin,
      cartCount,
      cartDrawerOpen,
      version,
      refresh,
      refreshCart: refresh,
      openCart() {
        setCartDrawerOpen(true);
      },
      closeCart() {
        setCartDrawerOpen(false);
      },
      loginUser(identifier, password) {
        const user = authService.loginUser(identifier, password);
        setCurrentUser(user);
        refresh();
        return user;
      },
      registerUser(values) {
        const user = authService.registerUser(values);
        setCurrentUser(user);
        refresh();
        return user;
      },
      logoutUser() {
        authService.logoutUser();
        setCurrentUser(null);
        refresh();
      },
      loginAdmin(identifier, password) {
        const admin = authService.loginAdmin(identifier, password);
        setCurrentAdmin(admin);
        refresh();
        return admin;
      },
      logoutAdmin() {
        authService.logoutAdmin();
        setCurrentAdmin(null);
        refresh();
      },
    }),
    [cartCount, cartDrawerOpen, currentAdmin, currentUser, refresh, version],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
