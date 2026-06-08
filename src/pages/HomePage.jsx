import { App, Button, Carousel, Col, Input, Row, Space, Statistic, Typography } from 'antd';
import { FireOutlined, SearchOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState, useRef } from 'react';

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

  
  const searchInputRef = useRef(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);


  const [isScrolled, setIsScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll, {passive: true});
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const placeholders = ['搜索手机、咖啡、台灯、跑鞋', '搜索数码好物', '搜索运动装备', '搜索精选食品'];
  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIndex((i) => (i + 1) % placeholders.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

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
    <>
    <div className={`search-sticky-wrap${isScrolled ? ' scrolled' : ''}`}>
        <Input.Search
          ref={searchInputRef}
          size="large"
          allowClear
          placeholder={placeholders[placeholderIndex]}
          onSearch={setKeyword}
          onChange={(event) => setKeyword(event.target.value)}
          style={{ width: '100%' }}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          onClick={() => {
            if (isSearchFocused && searchInputRef.current) {
              searchInputRef.current.blur();
            }
          }}
        />
      </div>
    <Space orientation="vertical" size={0} style={{ width: '100%' }}>
      <Carousel autoplay dots>
        <div>
          <section className="hero-panel">
            <Typography.Title level={1}>把校园好物装进一站式商城</Typography.Title>
            <Typography.Paragraph>
              一站式校园商品采购平台，满足你的所有需求。
            </Typography.Paragraph>
            <Space wrap>
              <Button type="primary" size="large" icon={<ShoppingCartOutlined />} onClick={() => navigate('/category')}>
                开始选购
              </Button>
            </Space>
          </section>
        </div>
        <div>
          <section className="hero-panel" style={{ backgroundImage: "linear-gradient(120deg, rgba(255,255,255,.55), rgba(0,0,0,.20)), url('https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?auto=format&fit=crop&w=1400&q=80')" }}>
            <Typography.Title level={1}>限时热卖商品实时联动</Typography.Title>
            <Typography.Paragraph>
              浏览热门商品，享受超值折扣。
            </Typography.Paragraph>
          </section>
        </div>
      </Carousel>

      
      
      {!keyword && (
        <div className="quick-categories">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="quick-category-item"
              onClick={() => navigate(`/category?cat=${cat.id}`)}
            >
              <span className="quick-category-name">{cat.name}</span>
            </div>
          ))}
        </div>
      )}
      <div>
        <div className="section-head">
          <div>
            <Typography.Title level={2}>
              <FireOutlined /> {keyword ? '搜索结果' : '热门商品'}
            </Typography.Title>
          </div>
        </div>
        <Row gutter={[16, 16]}>
          {hotProducts.map((product, index) => (
            <Col key={product.id} xs={24} sm={12} lg={6} className='fade-in-section'>
              <ProductCard product={product} onAddCart={handleAddCart} rank={index + 1} showSold/>
            </Col>
          ))}
        </Row>
      </div>
    </Space>
    </>
  );
}
