import productService from './productService.js';

const DEFAULT_MODEL = 'gpt-4o-mini';

function envValue(key) {
  return (import.meta.env?.[key] || '').trim();
}

function normalizeText(value) {
  return String(value || '').trim().toLowerCase();
}

function tokenize(text) {
  return normalizeText(text)
    .split(/[\s,，。.!！?？、/\\|;；:：()[\]{}"'“”‘’<>《》]+/)
    .map((token) => token.trim())
    .filter(Boolean);
}

function productSearchText(product) {
  return [
    product.name,
    product.subtitle,
    product.description,
    product.categoryId,
    ...(Array.isArray(product.tags) ? product.tags : []),
  ]
    .map(normalizeText)
    .filter(Boolean)
    .join(' ');
}

function discountScore(product) {
  const price = Number(product.price || 0);
  const originalPrice = Number(product.originalPrice || price);
  if (!price || !originalPrice || originalPrice <= price) return 0;
  return ((originalPrice - price) / originalPrice) * 8;
}

function localAnswer(question, products) {
  const names = products.map((product) => product.name).join('、');
  if (!products.length) {
    return `我先根据当前上架商品为你筛选了一下，但暂时没有特别匹配“${question}”的结果。你可以换个预算、用途或品类再问我。`;
  }
  return `我按你的需求优先参考了商品标题、卖点、折扣和销量。推荐先看看：${names}。`;
}

function getProductContext(products) {
  return products
    .map((product) => {
      const tags = Array.isArray(product.tags) && product.tags.length ? ` 标签：${product.tags.join('、')}` : '';
      return `- ${product.id}｜${product.name}｜¥${product.price}｜销量${product.sold || 0}｜${product.subtitle || ''}${tags}`;
    })
    .join('\n');
}

function extractAnswer(data) {
  return String(data?.choices?.[0]?.message?.content || '').trim();
}

export function recommendProducts(question, limit = 3) {
  const safeLimit = Math.max(1, Number(limit) || 3);
  const products = productService.getVisibleProducts();
  const visibleProducts = Array.isArray(products) ? products : [];
  const tokens = tokenize(question);
  const query = normalizeText(question);

  return visibleProducts
    .map((product) => {
      const searchable = productSearchText(product);
      const keywordScore = tokens.reduce((score, token) => {
        if (searchable.includes(token)) return score + (token.length > 1 ? 8 : 2);
        return score;
      }, query && searchable.includes(query) ? 10 : 0);
      const soldScore = Math.log10(Number(product.sold || 0) + 1);
      return {
        product,
        score: keywordScore + discountScore(product) + soldScore,
      };
    })
    .sort((a, b) => b.score - a.score || Number(b.product.sold || 0) - Number(a.product.sold || 0))
    .slice(0, safeLimit)
    .map(({ product }) => product);
}

export async function askSupport(question) {
  const text = String(question || '').trim();
  const products = recommendProducts(text);
  const host = envValue('VITE_CUSTOM_HOST').replace(/\/+$/, '');
  const key = envValue('VITE_CUSTOM_KEY');
  const model = envValue('VITE_CUSTOM_MODEL') || DEFAULT_MODEL;

  if (!host || !key) {
    return {
      answer: localAnswer(text || '商品咨询', products),
      products,
      source: 'local',
    };
  }

  try {
    const response = await fetch(`${host}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content:
              '你是 EasyTrade 商城的智能客服。请用简洁中文回答用户问题，只推荐提供的上架商品，不编造库存、价格或链接。',
          },
          {
            role: 'user',
            content: `用户问题：${text}\n\n可推荐商品：\n${getProductContext(products)}`,
          },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      return {
        answer: localAnswer(text || '商品咨询', products),
        products,
        source: 'local',
      };
    }

    const data = await response.json();
    const answer = extractAnswer(data);
    return {
      answer: answer || localAnswer(text || '商品咨询', products),
      products,
      source: answer ? 'remote' : 'local',
    };
  } catch {
    return {
      answer: localAnswer(text || '商品咨询', products),
      products,
      source: 'local',
    };
  }
}

export default {
  askSupport,
  recommendProducts,
};
