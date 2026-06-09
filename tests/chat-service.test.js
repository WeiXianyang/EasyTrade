import test from 'node:test';
import assert from 'node:assert/strict';

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

globalThis.localStorage = createMemoryStorage();

const chatService = await import('../src/services/chatService.js');

test('smart support falls back to local recommendations when custom key is missing', async () => {
  globalThis.localStorage.clear();
  delete globalThis.__EASYTRADE_CHAT_ENV__;

  const result = await chatService.askSupport('我想要能提亮肤色的面膜');

  assert.equal(result.source, 'local');
  assert.equal(typeof result.answer, 'string');
  assert.ok(result.answer.length > 0);
  assert.ok(Array.isArray(result.products));
  assert.ok(result.products.length > 0);
});

test('smart support falls back to local recommendations when configured fetch fails', async () => {
  globalThis.localStorage.clear();
  globalThis.__EASYTRADE_CHAT_ENV__ = {
    VITE_CUSTOM_HOST: 'https://mock-chat.example/v1/',
    VITE_CUSTOM_KEY: 'test-key',
    VITE_CUSTOM_MODEL: 'test-model',
  };

  const originalFetch = globalThis.fetch;
  let fetchCalls = 0;
  globalThis.fetch = async () => {
    fetchCalls += 1;
    throw new Error('network down');
  };

  try {
    const result = await chatService.askSupport('我想要能提亮肤色的面膜');

    assert.equal(fetchCalls, 1);
    assert.equal(result.source, 'local');
    assert.equal(typeof result.answer, 'string');
    assert.ok(result.answer.length > 0);
    assert.ok(Array.isArray(result.products));
    assert.ok(result.products.length > 0);
  } finally {
    globalThis.fetch = originalFetch;
    delete globalThis.__EASYTRADE_CHAT_ENV__;
  }
});
