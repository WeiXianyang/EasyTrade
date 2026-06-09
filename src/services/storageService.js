import { STORAGE_KEYS, seedCategories, seedOrders, seedProducts, seedRolePermissions, seedUsers } from '../mock/seedData.js';

const seedByKey = {
  [STORAGE_KEYS.products]: seedProducts,
  [STORAGE_KEYS.categories]: seedCategories,
  [STORAGE_KEYS.orders]: seedOrders,
  [STORAGE_KEYS.users]: seedUsers,
  [STORAGE_KEYS.carts]: [],
  [STORAGE_KEYS.rolePermissions]: seedRolePermissions,
  [STORAGE_KEYS.requestLogs]: [],
  [STORAGE_KEYS.auditLogs]: [],
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

/**
 * Builds the persistence adapter used by every domain service.
 *
 * The optional `storage` parameter keeps the browser implementation and the
 * Node test implementation on the same code path. Missing seeded keys are
 * initialized lazily, so the first read after a fresh install creates the mock
 * data expected by the UI.
 */
export function createStorageService(storage = globalThis.localStorage) {
  function ensureStorage() {
    if (!storage) {
      throw new Error('localStorage is not available');
    }
    return storage;
  }

  function read(key, fallback = null) {
    const raw = ensureStorage().getItem(key);
    if (!raw) {
      const seed = key in seedByKey ? clone(seedByKey[key]) : fallback;
      if (seed !== null) {
        write(key, seed);
      }
      return seed;
    }

    try {
      return JSON.parse(raw);
    } catch {
      // Corrupt localStorage should not break the app; reset this key and let
      // callers decide whether an empty fallback is acceptable.
      write(key, fallback);
      return fallback;
    }
  }

  function write(key, value) {
    ensureStorage().setItem(key, JSON.stringify(value));
    return value;
  }

  function remove(key) {
    ensureStorage().removeItem(key);
  }

  return {
    keys: STORAGE_KEYS,
    read,
    write,
    remove,
    reset({ preserveSessions = false } = {}) {
      const currentUser = preserveSessions ? read(STORAGE_KEYS.currentUser, null) : null;
      const currentAdmin = preserveSessions ? read(STORAGE_KEYS.currentAdmin, null) : null;

      Object.keys(seedByKey).forEach((key) => write(key, clone(seedByKey[key])));
      if (preserveSessions) {
        if (currentUser) write(STORAGE_KEYS.currentUser, currentUser);
        if (currentAdmin) write(STORAGE_KEYS.currentAdmin, currentAdmin);
      } else {
        remove(STORAGE_KEYS.currentUser);
        remove(STORAGE_KEYS.currentAdmin);
      }
    },
  };
}

const storageService = createStorageService();
export default storageService;
