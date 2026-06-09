import storageService from './storageService.js';

const DEFAULT_FOOTPRINT_LIMIT = 20;

function byNewest(left, right) {
  return String(right.createdAt || right.viewedAt || '').localeCompare(String(left.createdAt || left.viewedAt || ''));
}

function takeLimit(items, limit) {
  return Number.isFinite(limit) ? items.slice(0, limit) : items;
}

export function createUserActivityService(
  storage = storageService,
  { now = () => new Date().toISOString(), footprintLimit = DEFAULT_FOOTPRINT_LIMIT } = {},
) {
  function readList(key) {
    const value = storage.read(key, []);
    return Array.isArray(value) ? value : [];
  }

  function writeList(key, value) {
    return storage.write(key, value);
  }

  function getFavorites(userId, limit = Infinity) {
    return takeLimit(
      readList(storage.keys.favorites)
        .filter((item) => item.userId === userId)
        .sort(byNewest),
      limit,
    );
  }

  function getCategoryFollows(userId, limit = Infinity) {
    return takeLimit(
      readList(storage.keys.follows)
        .filter((item) => item.userId === userId && item.type === 'category')
        .sort(byNewest),
      limit,
    );
  }

  function getFootprints(userId, limit = Infinity) {
    return takeLimit(
      readList(storage.keys.footprints)
        .filter((item) => item.userId === userId)
        .sort((left, right) => String(right.viewedAt || '').localeCompare(String(left.viewedAt || ''))),
      limit,
    );
  }

  return {
    getFavorites,
    getCategoryFollows,
    getFootprints,
    getFavoriteProductIds(userId, limit = Infinity) {
      return getFavorites(userId, limit).map((item) => item.productId);
    },
    getFollowedCategoryIds(userId, limit = Infinity) {
      return getCategoryFollows(userId, limit).map((item) => item.categoryId);
    },
    isFavorite(userId, productId) {
      return readList(storage.keys.favorites).some((item) => item.userId === userId && item.productId === productId);
    },
    isFollowingCategory(userId, categoryId) {
      return readList(storage.keys.follows).some(
        (item) => item.userId === userId && item.type === 'category' && item.categoryId === categoryId,
      );
    },
    toggleFavorite(userId, productId) {
      const favorites = readList(storage.keys.favorites);
      const existingIndex = favorites.findIndex((item) => item.userId === userId && item.productId === productId);
      if (existingIndex >= 0) {
        const nextFavorites = favorites.filter((_, index) => index !== existingIndex);
        writeList(storage.keys.favorites, nextFavorites);
        return { favorited: false, favorites: getFavorites(userId) };
      }

      writeList(storage.keys.favorites, [
        { userId, productId, createdAt: now() },
        ...favorites,
      ]);
      return { favorited: true, favorites: getFavorites(userId) };
    },
    toggleCategoryFollow(userId, categoryId) {
      const follows = readList(storage.keys.follows);
      const existingIndex = follows.findIndex(
        (item) => item.userId === userId && item.type === 'category' && item.categoryId === categoryId,
      );
      if (existingIndex >= 0) {
        const nextFollows = follows.filter((_, index) => index !== existingIndex);
        writeList(storage.keys.follows, nextFollows);
        return { following: false, follows: getCategoryFollows(userId) };
      }

      writeList(storage.keys.follows, [
        { userId, type: 'category', categoryId, createdAt: now() },
        ...follows,
      ]);
      return { following: true, follows: getCategoryFollows(userId) };
    },
    recordFootprint(userId, productId) {
      const footprints = readList(storage.keys.footprints);
      const nextFootprints = [
        { userId, productId, viewedAt: now() },
        ...footprints.filter((item) => !(item.userId === userId && item.productId === productId)),
      ].slice(0, footprintLimit);
      writeList(storage.keys.footprints, nextFootprints);
      return getFootprints(userId);
    },
  };
}

const userActivityService = createUserActivityService();
export default userActivityService;
