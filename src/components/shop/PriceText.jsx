import { Space, Typography } from 'antd';

export default function PriceText({ price, originalPrice, size = 'default' }) {
  return (
    <Space size={8} align="baseline">
      <Typography.Text className="price" style={{ fontSize: size === 'large' ? 28 : 18 }}>
        ¥{Number(price).toFixed(0)}
      </Typography.Text>
      {originalPrice > price && (
        <Typography.Text className="original-price">¥{Number(originalPrice).toFixed(0)}</Typography.Text>
      )}
    </Space>
  );
}
