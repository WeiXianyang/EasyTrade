import test from 'node:test';
import assert from 'node:assert/strict';

import { createStorageService } from '../src/services/storageService.js';
import { createUserActivityService } from '../src/services/userActivityService.js';

function createMemoryStorage() {
  const data = new Map();
  return {
    getItem(key) {
      return data.has(key) ? data.get(key) : null;
    },
    setItem(key, value) {
      data.set(key, String(value));
    },
    removeItem(key) {
      data.delete(key);
    },
    clear() {
      data.clear();
    },
  };
}

function createActivityService(nowValues = [], options = {}) {
  const storage = createStorageService(createMemoryStorage());
  let tick = 0;
  const activityService = createUserActivityService(storage, {
    now: () => nowValues[tick++] || `2026-06-09T10:00:${String(tick).padStart(2, '0')}.000Z`,
    ...options,
  });
  return { activityService, storage };
}

test('user activity service toggles product favorites per user and persists them', () => {
  const { activityService, storage } = createActivityService([
    '2026-06-09T10:01:00.000Z',
    '2026-06-09T10:02:00.000Z',
  ]);

  const favorited = activityService.toggleFavorite('u-demo', 'p-phone');
  assert.equal(favorited.favorited, true);
  assert.equal(activityService.isFavorite('u-demo', 'p-phone'), true);
  assert.deepEqual(activityService.getFavoriteProductIds('u-demo'), ['p-phone']);

  const reloaded = createUserActivityService(storage);
  assert.equal(reloaded.isFavorite('u-demo', 'p-phone'), true);

  const removed = reloaded.toggleFavorite('u-demo', 'p-phone');
  assert.equal(removed.favorited, false);
  assert.equal(reloaded.isFavorite('u-demo', 'p-phone'), false);
  assert.deepEqual(reloaded.getFavoriteProductIds('u-demo'), []);
});

test('user activity service toggles followed categories per user', () => {
  const { activityService } = createActivityService([
    '2026-06-09T10:03:00.000Z',
    '2026-06-09T10:04:00.000Z',
  ]);

  activityService.toggleCategoryFollow('u-demo', 'digital');
  activityService.toggleCategoryFollow('u-demo', 'food');
  activityService.toggleCategoryFollow('u-other', 'home');

  assert.deepEqual(activityService.getFollowedCategoryIds('u-demo'), ['food', 'digital']);
  assert.equal(activityService.isFollowingCategory('u-demo', 'digital'), true);
  assert.equal(activityService.isFollowingCategory('u-demo', 'home'), false);

  const removed = activityService.toggleCategoryFollow('u-demo', 'digital');
  assert.equal(removed.following, false);
  assert.deepEqual(activityService.getFollowedCategoryIds('u-demo'), ['food']);
});

test('user activity service records footprints newest first, deduped, and capped', () => {
  const { activityService } = createActivityService(Array.from({ length: 25 }, (_, index) => `2026-06-09T10:${String(index).padStart(2, '0')}:00.000Z`));

  for (let index = 0; index < 21; index += 1) {
    activityService.recordFootprint('u-demo', `p-${index}`);
  }
  activityService.recordFootprint('u-demo', 'p-5');

  const footprints = activityService.getFootprints('u-demo');
  assert.equal(footprints.length, 20);
  assert.equal(footprints[0].productId, 'p-5');
  assert.equal(footprints.filter((item) => item.productId === 'p-5').length, 1);
  assert.equal(footprints.some((item) => item.productId === 'p-0'), false);
  assert.equal(footprints[0].viewedAt, '2026-06-09T10:21:00.000Z');
});

test('user activity service removes all duplicate favorites and follows when toggled off', () => {
  const { activityService, storage } = createActivityService();
  storage.write(storage.keys.favorites, [
    { userId: 'u-demo', productId: 'p-phone', createdAt: '2026-06-09T10:01:00.000Z' },
    { userId: 'u-demo', productId: 'p-phone', createdAt: '2026-06-09T10:02:00.000Z' },
    { userId: 'u-demo', productId: 'p-watch', createdAt: '2026-06-09T10:03:00.000Z' },
    { userId: 'u-other', productId: 'p-phone', createdAt: '2026-06-09T10:04:00.000Z' },
  ]);
  storage.write(storage.keys.follows, [
    { userId: 'u-demo', type: 'category', categoryId: 'digital', createdAt: '2026-06-09T10:01:00.000Z' },
    { userId: 'u-demo', type: 'category', categoryId: 'digital', createdAt: '2026-06-09T10:02:00.000Z' },
    { userId: 'u-demo', type: 'category', categoryId: 'food', createdAt: '2026-06-09T10:03:00.000Z' },
    { userId: 'u-other', type: 'category', categoryId: 'digital', createdAt: '2026-06-09T10:04:00.000Z' },
  ]);

  const favoriteResult = activityService.toggleFavorite('u-demo', 'p-phone');
  const followResult = activityService.toggleCategoryFollow('u-demo', 'digital');

  assert.equal(favoriteResult.favorited, false);
  assert.equal(activityService.isFavorite('u-demo', 'p-phone'), false);
  assert.deepEqual(activityService.getFavoriteProductIds('u-demo'), ['p-watch']);
  assert.deepEqual(activityService.getFavoriteProductIds('u-other'), ['p-phone']);
  assert.equal(followResult.following, false);
  assert.equal(activityService.isFollowingCategory('u-demo', 'digital'), false);
  assert.deepEqual(activityService.getFollowedCategoryIds('u-demo'), ['food']);
  assert.deepEqual(activityService.getFollowedCategoryIds('u-other'), ['digital']);
});

test('user activity service ignores invalid ids and filters invalid historical records', () => {
  const { activityService, storage } = createActivityService(['2026-06-09T10:05:00.000Z']);
  storage.write(storage.keys.favorites, [
    { userId: 'u-demo', productId: 'p-phone', createdAt: '2026-06-09T10:01:00.000Z' },
    { userId: 'u-demo', productId: '', createdAt: '2026-06-09T10:02:00.000Z' },
    { userId: '', productId: 'p-watch', createdAt: '2026-06-09T10:03:00.000Z' },
    { userId: 'u-demo', productId: 'p-phone', createdAt: '2026-06-09T10:04:00.000Z' },
  ]);
  storage.write(storage.keys.follows, [
    { userId: 'u-demo', type: 'category', categoryId: 'digital', createdAt: '2026-06-09T10:01:00.000Z' },
    { userId: 'u-demo', type: 'category', categoryId: '', createdAt: '2026-06-09T10:02:00.000Z' },
    { userId: 'u-demo', type: 'shop', categoryId: 'food', createdAt: '2026-06-09T10:03:00.000Z' },
    { userId: 'u-demo', type: 'category', categoryId: 'digital', createdAt: '2026-06-09T10:04:00.000Z' },
  ]);
  storage.write(storage.keys.footprints, [
    { userId: 'u-demo', productId: 'p-phone', viewedAt: '2026-06-09T10:01:00.000Z' },
    { userId: 'u-demo', productId: '', viewedAt: '2026-06-09T10:02:00.000Z' },
    { userId: '', productId: 'p-watch', viewedAt: '2026-06-09T10:03:00.000Z' },
    { userId: 'u-demo', productId: 'p-phone', viewedAt: '2026-06-09T10:04:00.000Z' },
  ]);
  const beforeFavorites = storage.read(storage.keys.favorites, []);
  const beforeFollows = storage.read(storage.keys.follows, []);
  const beforeFootprints = storage.read(storage.keys.footprints, []);

  assert.deepEqual(activityService.getFavoriteProductIds('u-demo'), ['p-phone']);
  assert.deepEqual(activityService.getFollowedCategoryIds('u-demo'), ['digital']);
  assert.deepEqual(activityService.getFootprints('u-demo').map((item) => item.productId), ['p-phone']);
  assert.deepEqual(activityService.toggleFavorite('', 'p-coffee'), { favorited: false, favorites: [] });
  assert.deepEqual(activityService.toggleCategoryFollow('u-demo', ''), { following: false, follows: ['digital'].map((categoryId) => ({ userId: 'u-demo', type: 'category', categoryId, createdAt: '2026-06-09T10:04:00.000Z' })) });
  assert.deepEqual(activityService.recordFootprint('u-demo', ''), activityService.getFootprints('u-demo'));
  assert.deepEqual(storage.read(storage.keys.favorites, []), beforeFavorites);
  assert.deepEqual(storage.read(storage.keys.follows, []), beforeFollows);
  assert.deepEqual(storage.read(storage.keys.footprints, []), beforeFootprints);
});

test('user activity service caps footprints per user without deleting other users footprints', () => {
  const { activityService, storage } = createActivityService(
    Array.from({ length: 8 }, (_, index) => `2026-06-09T11:0${index}:00.000Z`),
    { footprintLimit: 3 },
  );

  activityService.recordFootprint('u-other', 'p-stay-1');
  activityService.recordFootprint('u-other', 'p-stay-2');
  activityService.recordFootprint('u-demo', 'p-1');
  activityService.recordFootprint('u-demo', 'p-2');
  activityService.recordFootprint('u-demo', 'p-3');
  activityService.recordFootprint('u-demo', 'p-4');

  assert.deepEqual(activityService.getFootprints('u-demo').map((item) => item.productId), ['p-4', 'p-3', 'p-2']);
  assert.deepEqual(activityService.getFootprints('u-other').map((item) => item.productId), ['p-stay-2', 'p-stay-1']);
  assert.equal(storage.read(storage.keys.footprints, []).some((item) => item.userId === 'u-other'), true);
});
