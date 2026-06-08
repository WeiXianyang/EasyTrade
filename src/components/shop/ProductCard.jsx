import { Button, Card, Space, Tag, Typography } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import PriceText from './PriceText.jsx';

export default function ProductCard({ product, onAddCart, rank, showSold }) {
  const navigate = useNavigate();

  const discount = product.originalPrice > product.price
    ? Math.round((1-product.price/product.originalPrice)*100)
    : 0;
  const isSoldOut = product.stock === 0;

  return (
    <Card
      className={`product-card ${isSoldOut ? 'sold-out' : ''}`}
      hoverable
      cover={
        <div className='product-card-img-wrap'>
          {rank !== undefined && rank<=3 &&(
            <span className={`product-rank-badge${rank <= 3 ? ` rank-top-${rank}` : ''}`}>
              {rank}
            </span>
          )}
          {discount > 0 && <span className='discount-badge'>-{discount}%</span>}
          {isSoldOut && <div className='sold-out-overlay'>已售罄</div>}
          <img className='product-cover' src={product.image} alt={product.name} />
        </div>
      }
      actions={[
        <Button key="detail" type="link" onClick={() => navigate(`/detail/${product.id}`)}>
          查看详情
        </Button>,
        <Button key="cart" type="link" icon={<ShoppingCartOutlined />} onClick={() => onAddCart(product)}>
          加入购物车
        </Button>,
      ]}
    >
      <Space orientation="vertical" size={8} style={{ width: '100%' }}>
        <Typography.Text strong ellipsis title={product.name}>
          {product.name}
        </Typography.Text>
        <Typography.Text type="secondary" ellipsis title={product.subtitle}>
          {product.subtitle}
        </Typography.Text>
        <PriceText price={product.price} originalPrice={product.originalPrice} />
        {
          product.stock > 0 && product.stock <=10 &&(
            <span className='stock-warning'>仅剩{product.stock}件</span>
          )}
        <Space wrap size={6}>
          {product.tags.map((tag) => (
            <Tag key={tag} color={tag === '新品' ? 'green' : 'orange'}>
              {tag}
            </Tag>
          ))}
          {showSold && (
            <Typography.Text style={{ fontSize: 12, color: '#94a3b8' }}>
              已售 {product.sold}
            </Typography.Text>
          )}
        </Space>
      </Space>
    </Card>
  );
}
