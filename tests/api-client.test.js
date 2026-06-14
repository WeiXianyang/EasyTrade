import test from 'node:test';
import assert from 'node:assert/strict';

import {
  TOKEN_STORAGE_KEY,
  clearAuthToken,
  getStoredToken,
  handleApiError,
  resolveApiBaseUrl,
  storeAuthToken,
  unwrapApiResponse,
} from '../src/api/request.js';

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
  };
}

test('api client resolves the production easytrade API prefix from the app base path', () => {
  assert.equal(resolveApiBaseUrl({ VITE_APP_BASE_PATH: '/easytrade/' }), '/easytrade/api');
  assert.equal(resolveApiBaseUrl({ VITE_API_BASE_URL: 'https://api.example.test' }), 'https://api.example.test');
  assert.equal(resolveApiBaseUrl({}), '/api');
});

test('api client stores auth token in the EasyTrade localStorage key', () => {
  globalThis.localStorage = createMemoryStorage();

  storeAuthToken('token-123');

  assert.equal(globalThis.localStorage.getItem(TOKEN_STORAGE_KEY), 'token-123');
  assert.equal(getStoredToken(), 'token-123');

  clearAuthToken();
  assert.equal(getStoredToken(), null);
});

test('api client unwraps backend response envelopes', () => {
  assert.deepEqual(unwrapApiResponse({ data: { code: 200, message: 'success', data: { ok: true } } }), { ok: true });
  assert.deepEqual(unwrapApiResponse({ data: { ok: true } }), { ok: true });
});

test('api client clears token on unauthorized responses', async () => {
  globalThis.localStorage = createMemoryStorage();
  storeAuthToken('expired-token');

  await assert.rejects(() => handleApiError({ response: { status: 401 } }), /登录已过期/);

  assert.equal(getStoredToken(), null);
});
