import { Button, Card, Space, Tag, Typography } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import PriceText from './PriceText.jsx';

export default function ProductCard({ product, onAddCart }) {
  const navigate = useNavigate();

  return (
    <Card
      className="product-card"
      hoverable
      cover={<img className="product-cover" src={product.image} alt={product.name} />}
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
        <Space wrap size={6}>
          {product.tags.map((tag) => (
            <Tag key={tag} color={tag === '新品' ? 'green' : 'orange'}>
              {tag}
            </Tag>
          ))}
        </Space>
      </Space>
    </Card>
  );
}
