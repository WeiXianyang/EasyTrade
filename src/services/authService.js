import storageService from './storageService.js';

function withoutPassword(user) {
  if (!user) {
    return null;
  }
  const safeUser = { ...user };
  delete safeUser.password;
  return safeUser;
}

/**
 * Handles frontend and admin authentication against the seeded user list.
 *
 * Login state stores a password-free user snapshot in localStorage; the original
 * password remains only in the mock user table so route guards and page headers
 * never receive credential fields.
 */
export function createAuthService(storage = storageService) {
  function getUsers() {
    return storage.read(storage.keys.users, []);
  }

  function saveUsers(users) {
    return storage.write(storage.keys.users, users);
  }

  function findUser(identifier, password, roles) {
    return getUsers().find((user) => {
      const matchesIdentifier =
        user.username === identifier || user.email === identifier || user.phone === identifier;
      return matchesIdentifier && user.password === password && roles.includes(user.role);
    });
  }

  function getCachedSession(key, roles) {
    const cachedUser = storage.read(key, null);
    if (!cachedUser?.id) {
      return null;
    }

    const liveUser = getUsers().find((user) => user.id === cachedUser.id && roles.includes(user.role));
    if (!liveUser) {
      storage.remove(key);
      return null;
    }

    const safeUser = withoutPassword(liveUser);
    storage.write(key, safeUser);
    return safeUser;
  }

  return {
    loginUser(identifier, password) {
      const user = findUser(identifier, password, ['customer']);
      if (!user) {
        throw new Error('账号或密码错误');
      }
      const safeUser = withoutPassword(user);
      storage.write(storage.keys.currentUser, safeUser);
      return safeUser;
    },
    registerUser(values) {
      const users = getUsers();
      if (users.some((user) => user.email === values.email || user.username === values.username)) {
        throw new Error('账号已存在');
      }
      const user = {
        id: `u-${Date.now()}`,
        username: values.username,
        email: values.email,
        phone: values.phone,
        password: values.password,
        role: 'customer',
        name: values.name || values.username,
        address: {
          name: values.name || values.username,
          phone: values.phone,
          detail: values.address || '',
        },
      };
      saveUsers([...users, user]);
      const safeUser = withoutPassword(user);
      storage.write(storage.keys.currentUser, safeUser);
      return safeUser;
    },
    getCurrentUser() {
      return getCachedSession(storage.keys.currentUser, ['customer']);
    },
    logoutUser() {
      storage.remove(storage.keys.currentUser);
    },
    loginAdmin(identifier, password) {
      const admin = findUser(identifier, password, ['admin', 'operator']);
      if (!admin) {
        throw new Error('后台账号或密码错误');
      }
      const safeAdmin = withoutPassword(admin);
      storage.write(storage.keys.currentAdmin, safeAdmin);
      return safeAdmin;
    },
    setCurrentAdmin(admin) {
      if (!admin?.id || !admin?.username || !['admin', 'operator'].includes(admin.role)) {
        throw new Error('无效的后台身份');
      }
      const safeAdmin = withoutPassword({
        id: admin.id,
        username: admin.username,
        role: admin.role,
        name: admin.name || admin.username,
      });
      storage.write(storage.keys.currentAdmin, safeAdmin);
      return safeAdmin;
    },
    getCurrentAdmin() {
      return getCachedSession(storage.keys.currentAdmin, ['admin', 'operator']);
    },
    logoutAdmin() {
      storage.remove(storage.keys.currentAdmin);
    },
  };
}

const authService = createAuthService();
export default authService;
