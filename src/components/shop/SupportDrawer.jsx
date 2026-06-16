import { App, Button, Drawer, Flex, Input, Space, Tag, Typography } from 'antd';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import chatService from '../../services/chatService.js';
import { formatCurrency } from '../../utils/format.js';
import './SupportDrawer.css';

const STARTER_QUESTION = '我想要能提亮肤色的面膜，可以推荐一款吗？';

const initialMessages = [
  {
    id: 'hello',
    role: 'assistant',
    content: '你好，我是 EasyTrade 智能客服。可以告诉我你的预算、用途或想买的品类，我会结合当前上架商品给你推荐。',
    products: [],
  },
];

function createMessage(role, content, products = []) {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    role,
    content,
    products: Array.isArray(products) ? products : [],
  };
}

export default function SupportDrawer({ open, onClose }) {
  const { message } = App.useApp();
  const [messages, setMessages] = useState(initialMessages);
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState('');

  const ask = async (value) => {
    const text = String(value || '').trim();
    if (!text || loading) return;

    setQuestion('');
    setMessages((current) => [...current, createMessage('user', text)]);
    setLoading(true);

    try {
      const result = await chatService.askSupport(text);
      setMessages((current) => [
        ...current,
        createMessage('assistant', result?.answer || '我先为你整理了几款当前可购买的商品。', result?.products || []),
      ]);
    } catch {
      message?.warning?.('智能客服暂时不可用，已切换本地推荐。');
      setMessages((current) => [
        ...current,
        createMessage('assistant', '智能客服暂时不可用，我先按本地商品为你推荐。', []),
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer title="智能客服" placement="right" open={open} onClose={onClose} size="default">
      <Flex vertical gap={16} className="support-drawer">
        <div className="support-messages" role="log" aria-label="智能客服对话记录" aria-live="polite">
          {messages.map((item) => (
            <div key={item.id} className={`support-message support-message-${item.role}`}>
              <Typography.Paragraph className="support-message-content">{item.content}</Typography.Paragraph>
              {(item.products || []).length > 0 ? (
                <div className="support-products">
                  <Typography.Text className="support-products-title">商品推荐</Typography.Text>
                  <Space orientation="vertical" size={8} className="support-product-list">
                    {item.products.map((product) => (
                      <Link
                        key={product.id}
                        className="support-product-link"
                        to={`/detail/${product.id}`}
                        onClick={onClose}
                      >
                        <Flex vertical gap={4}>
                          <Typography.Text strong ellipsis>
                            {product.name}
                          </Typography.Text>
                          <Typography.Text className="muted" ellipsis>
                            {product.subtitle || product.description || '当前上架商品'}
                          </Typography.Text>
                          <Space size={6} wrap>
                            <Tag color="green">{formatCurrency(product.price)}</Tag>
                            {Array.isArray(product.tags)
                              ? product.tags.slice(0, 2).map((tag) => (
                                  <Tag key={tag} variant="filled">
                                    {tag}
                                  </Tag>
                                ))
                              : null}
                          </Space>
                        </Flex>
                      </Link>
                    ))}
                  </Space>
                </div>
              ) : null}
            </div>
          ))}
        </div>
        <Button block onClick={() => ask(STARTER_QUESTION)} disabled={loading}>
          {STARTER_QUESTION}
        </Button>
        <Input.Search
          placeholder="问问商品、预算或用途"
          enterButton="发送"
          loading={loading}
          disabled={loading}
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          onSearch={() => ask(question)}
        />
      </Flex>
    </Drawer>
  );
}
