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

const fakeProducts = [
  {
    id: 'p-mask',
    name: '焕亮补水面膜',
    subtitle: '提亮肤色，补水保湿',
    description: '适合熬夜后急救护理。',
    categoryId: 'beauty',
    price: 59,
    originalPrice: 79,
    stock: 20,
    sold: 1200,
    status: 'on',
    tags: ['提亮', '面膜'],
  },
  {
    id: 'p-lamp',
    name: 'Luma 护眼台灯',
    subtitle: '无频闪调光',
    description: '宿舍书桌友好。',
    categoryId: 'home',
    price: 189,
    originalPrice: 239,
    stock: 44,
    sold: 710,
    status: 'on',
    tags: ['学习'],
  },
];

test('smart support falls back to local recommendations when custom key is missing', async () => {
  globalThis.localStorage.clear();

  const result = await chatService.askSupport('我想要能提亮肤色的面膜');

  assert.equal(result.source, 'local');
  assert.equal(typeof result.answer, 'string');
  assert.ok(result.answer.length > 0);
  assert.ok(Array.isArray(result.products));
  assert.ok(result.products.length > 0);
});

test('smart support falls back to local recommendations when configured fetch fails', async () => {
  let fetchCalls = 0;
  const service = chatService.createChatService({
    env: {
      VITE_CUSTOM_HOST: 'https://mock-chat.example/v1/',
      VITE_CUSTOM_KEY: 'test-key',
      VITE_CUSTOM_MODEL: 'test-model',
    },
    fetchImpl: async () => {
      fetchCalls += 1;
      throw new Error('network down');
    },
    products: fakeProducts,
  });

  const result = await service.askSupport('我想要能提亮肤色的面膜');

  assert.equal(fetchCalls, 1);
  assert.equal(result.source, 'local');
  assert.equal(typeof result.answer, 'string');
  assert.ok(result.answer.length > 0);
  assert.ok(Array.isArray(result.products));
  assert.ok(result.products.length > 0);
});

test('smart support falls back to local recommendations when remote response is not ok', async () => {
  let requestUrl = '';
  const service = chatService.createChatService({
    env: {
      VITE_CUSTOM_HOST: 'https://mock-chat.example/v1/',
      VITE_CUSTOM_KEY: 'test-key',
      VITE_CUSTOM_MODEL: 'test-model',
    },
    fetchImpl: async (url) => {
      requestUrl = url;
      return { ok: false, status: 500 };
    },
    products: fakeProducts,
  });

  const result = await service.askSupport('面膜');

  assert.equal(requestUrl, 'https://mock-chat.example/v1/chat/completions');
  assert.equal(result.source, 'local');
  assert.ok(result.products.length > 0);
});

test('smart support sends configured remote request and returns remote answer', async () => {
  let request;
  const service = chatService.createChatService({
    env: {
      VITE_CUSTOM_HOST: 'https://mock-chat.example/v1/',
      VITE_CUSTOM_KEY: 'test-key',
      VITE_CUSTOM_MODEL: 'test-model',
    },
    fetchImpl: async (url, options) => {
      request = { url, options, body: JSON.parse(options.body) };
      return {
        ok: true,
        async json() {
          return {
            choices: [{ message: { content: '建议选择焕亮补水面膜。' } }],
          };
        },
      };
    },
    products: fakeProducts,
  });

  const result = await service.askSupport('面膜');

  assert.equal(request.url, 'https://mock-chat.example/v1/chat/completions');
  assert.equal(request.options.method, 'POST');
  assert.equal(request.options.headers.Authorization, 'Bearer test-key');
  assert.equal(request.body.model, 'test-model');
  assert.match(request.body.messages[1].content, /焕亮补水面膜/);
  assert.equal(result.source, 'remote');
  assert.equal(result.answer, '建议选择焕亮补水面膜。');
  assert.ok(result.products.length > 0);
});
