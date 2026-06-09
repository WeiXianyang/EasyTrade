import { Button, Carousel, Col, Row, Space, Typography } from 'antd';
import { FireOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';

import ProductCard from '../components/shop/ProductCard.jsx';
import { useAddToCart } from '../hooks/useAddToCart.js';
import categoryService from '../services/categoryService.js';
import productService from '../services/productService.js';
import FancySearch from '../components/shop/FancySearch.jsx';
import { formatCurrency } from '../utils/format.js';

const searchPlaceholders = ['搜索手机、咖啡、台灯、跑鞋', '搜索数码好物', '搜索运动装备', '搜索精选食品'];

export default function HomePage() {
  const navigate = useNavigate();
  const handleAddCart = useAddToCart();
  const [keyword, setKeyword] = useState('');

  const [isScrolled, setIsScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll, {passive: true});
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIndex((i) => (i + 1) % searchPlaceholders.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const categories = categoryService.getCategories();
  const hasKeyword = keyword.trim().length > 0;
  const products = useMemo(() => productService.getVisibleProducts({ keyword }), [keyword]);
  const hotProducts = hasKeyword ? products : productService.getHotProducts(4);
  const flashSaleProducts = useMemo(() => products
    .filter((product) => product.originalPrice > product.price)
    .sort((a, b) => (b.originalPrice - b.price) - (a.originalPrice - a.price))
    .slice(0, 3), [products]);

  return (
    <>
      <div className={`search-sticky-wrap${isScrolled ? ' scrolled' : ''}`}>
        <FancySearch
          onSearch={setKeyword}
          placeholder={searchPlaceholders[placeholderIndex]}
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

        {!hasKeyword && (
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
        {!hasKeyword && flashSaleProducts.length > 0 && (
          <section className="flash-sale-section">
            <div className="section-head flash-sale-head">
              <div>
                <Typography.Title level={2}>
                  <FireOutlined /> 限时促销
                </Typography.Title>
              </div>
              <span className="flash-sale-chip">秒杀价</span>
            </div>
            <Row gutter={[16, 16]}>
              {flashSaleProducts.map((product) => (
                <Col key={product.id} xs={24} md={8}>
                  <article className="flash-sale-card">
                    <Link className="flash-sale-link" to={`/detail/${product.id}`}>
                      <div className="flash-sale-image-wrap">
                        <img src={product.image} alt={product.name} />
                        <span className="flash-price-badge">秒杀价</span>
                      </div>
                      <div className="flash-sale-info">
                        <Typography.Text className="flash-sale-name" ellipsis title={product.name}>
                          {product.name}
                        </Typography.Text>
                        <div className="flash-sale-price-line">
                          <span className="flash-sale-price">{formatCurrency(product.price)}</span>
                          <span className="original-price">{formatCurrency(product.originalPrice)}</span>
                        </div>
                      </div>
                    </Link>
                    <Button
                      className="flash-sale-cart-btn"
                      type="primary"
                      icon={<ShoppingCartOutlined />}
                      onClick={() => handleAddCart(product)}
                    >
                      加入购物车
                    </Button>
                  </article>
                </Col>
              ))}
            </Row>
          </section>
        )}
        <div>
          <div className="section-head">
            <div>
              <Typography.Title level={2}>
                <FireOutlined /> {hasKeyword ? '搜索结果' : '热门商品'}
              </Typography.Title>
            </div>
          </div>
          <Row gutter={[16, 16]}>
            {hotProducts.map((product, index) => (
              <Col key={product.id} xs={24} sm={12} lg={6} className="fade-in-section">
                <ProductCard product={product} onAddCart={handleAddCart} rank={index + 1} showSold />
              </Col>
            ))}
          </Row>
        </div>
      </Space>
    </>
  );
}
