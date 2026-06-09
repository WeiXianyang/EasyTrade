import storageService from './storageService.js';

const DEFAULT_FOOTPRINT_LIMIT = 20;

function byNewest(left, right) {
  return String(right.createdAt || right.viewedAt || '').localeCompare(String(left.createdAt || left.viewedAt || ''));
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function takeLimit(items, limit) {
  return Number.isFinite(limit) ? items.slice(0, limit) : items;
}

function dedupeByNewest(items, getKey) {
  const seen = new Set();
  return items
    .sort(byNewest)
    .filter((item) => {
      const key = getKey(item);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function normalizeFavorites(items) {
  return dedupeByNewest(
    items.filter((item) => isNonEmptyString(item?.userId) && isNonEmptyString(item?.productId)),
    (item) => `${item.userId}:${item.productId}`,
  );
}

function normalizeFollows(items) {
  return dedupeByNewest(
    items.filter((item) => (
      isNonEmptyString(item?.userId) &&
      item.type === 'category' &&
      isNonEmptyString(item?.categoryId)
    )),
    (item) => `${item.userId}:${item.type}:${item.categoryId}`,
  );
}

function normalizeFootprints(items) {
  return dedupeByNewest(
    items.filter((item) => isNonEmptyString(item?.userId) && isNonEmptyString(item?.productId)),
    (item) => `${item.userId}:${item.productId}`,
  );
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
    if (!isNonEmptyString(userId)) return [];
    return takeLimit(
      normalizeFavorites(readList(storage.keys.favorites))
        .filter((item) => item.userId === userId)
        .sort(byNewest),
      limit,
    );
  }

  function getCategoryFollows(userId, limit = Infinity) {
    if (!isNonEmptyString(userId)) return [];
    return takeLimit(
      normalizeFollows(readList(storage.keys.follows))
        .filter((item) => item.userId === userId && item.type === 'category')
        .sort(byNewest),
      limit,
    );
  }

  function getFootprints(userId, limit = Infinity) {
    if (!isNonEmptyString(userId)) return [];
    return takeLimit(
      normalizeFootprints(readList(storage.keys.footprints))
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
      if (!isNonEmptyString(userId) || !isNonEmptyString(productId)) return false;
      return normalizeFavorites(readList(storage.keys.favorites)).some(
        (item) => item.userId === userId && item.productId === productId,
      );
    },
    isFollowingCategory(userId, categoryId) {
      if (!isNonEmptyString(userId) || !isNonEmptyString(categoryId)) return false;
      return normalizeFollows(readList(storage.keys.follows)).some(
        (item) => item.userId === userId && item.type === 'category' && item.categoryId === categoryId,
      );
    },
    toggleFavorite(userId, productId) {
      if (!isNonEmptyString(userId) || !isNonEmptyString(productId)) {
        return { favorited: false, favorites: getFavorites(userId) };
      }
      const favorites = readList(storage.keys.favorites);
      const hasExisting = normalizeFavorites(favorites).some((item) => item.userId === userId && item.productId === productId);
      if (hasExisting) {
        const nextFavorites = favorites.filter((item) => !(item?.userId === userId && item?.productId === productId));
        writeList(storage.keys.favorites, normalizeFavorites(nextFavorites));
        return { favorited: false, favorites: getFavorites(userId) };
      }

      writeList(storage.keys.favorites, normalizeFavorites([
        { userId, productId, createdAt: now() },
        ...favorites,
      ]));
      return { favorited: true, favorites: getFavorites(userId) };
    },
    toggleCategoryFollow(userId, categoryId) {
      if (!isNonEmptyString(userId) || !isNonEmptyString(categoryId)) {
        return { following: false, follows: getCategoryFollows(userId) };
      }
      const follows = readList(storage.keys.follows);
      const hasExisting = normalizeFollows(follows).some(
        (item) => item.userId === userId && item.type === 'category' && item.categoryId === categoryId,
      );
      if (hasExisting) {
        const nextFollows = follows.filter(
          (item) => !(item?.userId === userId && item?.type === 'category' && item?.categoryId === categoryId),
        );
        writeList(storage.keys.follows, normalizeFollows(nextFollows));
        return { following: false, follows: getCategoryFollows(userId) };
      }

      writeList(storage.keys.follows, normalizeFollows([
        { userId, type: 'category', categoryId, createdAt: now() },
        ...follows,
      ]));
      return { following: true, follows: getCategoryFollows(userId) };
    },
    recordFootprint(userId, productId) {
      if (!isNonEmptyString(userId) || !isNonEmptyString(productId)) {
        return getFootprints(userId);
      }
      const footprints = normalizeFootprints(readList(storage.keys.footprints));
      const currentUserFootprints = footprints.filter((item) => item.userId === userId && item.productId !== productId);
      const otherUserFootprints = footprints.filter((item) => item.userId !== userId);
      const nextCurrentUserFootprints = takeLimit([
        { userId, productId, viewedAt: now() },
        ...currentUserFootprints,
      ], footprintLimit);
      writeList(storage.keys.footprints, normalizeFootprints([
        ...nextCurrentUserFootprints,
        ...otherUserFootprints,
      ]));
      return getFootprints(userId);
    },
  };
}

const userActivityService = createUserActivityService();
export default userActivityService;
