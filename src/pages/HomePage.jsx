import { App, Button, Carousel, Col, Input, Row, Space, Statistic, Typography } from 'antd';
import { FireOutlined, SearchOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import ProductCard from '../components/shop/ProductCard.jsx';
import { useApp } from '../contexts/useApp.js';
import cartService from '../services/cartService.js';
import categoryService from '../services/categoryService.js';
import productService from '../services/productService.js';

export default function HomePage() {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const { currentUser, openCart, refresh } = useApp();
  const [keyword, setKeyword] = useState('');
  const categories = categoryService.getCategories();
  const products = useMemo(() => productService.getVisibleProducts({ keyword }), [keyword]);
  const hotProducts = keyword ? products : productService.getHotProducts(4);

  const handleAddCart = (product) => {
    if (!currentUser) {
      message.warning('请先登录再加入购物车');
      navigate('/login');
      return;
    }
    cartService.addItem(currentUser.id, product.id, 1);
    refresh();
    openCart();
    message.success('已加入购物车');
  };

  return (
    <Space orientation="vertical" size={28} style={{ width: '100%' }}>
      <Carousel autoplay dots>
        <div>
          <section className="hero-panel">
            <Typography.Title level={1}>把校园好物装进一站式商城</Typography.Title>
            <Typography.Paragraph>
              EasyTrade 使用 React、Ant Design 和 localStorage 构建前后台联动，从浏览、购物车、下单到后台上下架形成完整闭环。
            </Typography.Paragraph>
            <Space wrap>
              <Button type="primary" size="large" icon={<ShoppingCartOutlined />} onClick={() => navigate('/category')}>
                开始选购
              </Button>
            </Space>
          </section>
        </div>
        <div>
          <section className="hero-panel" style={{ backgroundImage: "linear-gradient(120deg, rgba(31,41,51,.78), rgba(240,79,62,.35)), url('https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?auto=format&fit=crop&w=1400&q=80')" }}>
            <Typography.Title level={1}>限时热卖商品实时联动</Typography.Title>
            <Typography.Paragraph>
              后台商品管理修改价格、库存和上下架状态后，前台首页、分类和详情页会立即使用同一份持久化数据。
            </Typography.Paragraph>
          </section>
        </div>
      </Carousel>

      <Input.Search
        size="large"
        allowClear
        prefix={<SearchOutlined />}
        placeholder="搜索手机、咖啡、台灯、跑鞋"
        onSearch={setKeyword}
        onChange={(event) => setKeyword(event.target.value)}
      />

      <Row gutter={[16, 16]}>
        <Col xs={12} md={6}>
          <Statistic title="商品分类" value={categories.length} suffix="类" />
        </Col>
        <Col xs={12} md={6}>
          <Statistic title="在售商品" value={productService.getVisibleProducts().length} suffix="件" />
        </Col>
        <Col xs={12} md={6}>
          <Statistic title="模拟订单" value={1} suffix="笔" />
        </Col>
        <Col xs={12} md={6}>
          <Statistic title="数据联动" value="localStorage" />
        </Col>
      </Row>

      <div>
        <div className="section-head">
          <div>
            <Typography.Title level={2}>
              <FireOutlined /> {keyword ? '搜索结果' : '热门商品'}
            </Typography.Title>
            <Typography.Text className="muted">统一商品卡片、清晰价格层级、移动端自适应。</Typography.Text>
          </div>
          <Button onClick={() => navigate('/category')}>查看全部分类</Button>
        </div>
        <Row gutter={[16, 16]}>
          {hotProducts.map((product) => (
            <Col key={product.id} xs={24} sm={12} lg={6}>
              <ProductCard product={product} onAddCart={handleAddCart} />
            </Col>
          ))}
        </Row>
      </div>
    </Space>
  );
}
