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

function createActivityService(nowValues = []) {
  const storage = createStorageService(createMemoryStorage());
  let tick = 0;
  const activityService = createUserActivityService(storage, {
    now: () => nowValues[tick++] || `2026-06-09T10:00:${String(tick).padStart(2, '0')}.000Z`,
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
