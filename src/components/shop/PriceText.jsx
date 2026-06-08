import { Space, Typography } from 'antd';

export default function PriceText({ price, originalPrice, size = 'default' }) {
  const saved = originalPrice > price ? originalPrice - price : 0;
  return (
    <Space size={8} align="baseline">
      <Typography.Text className="price" style={{ fontSize: size === 'large' ? 28 : 18 }}>
        ¥{Number(price).toFixed(0)}
      </Typography.Text>
      {originalPrice > price && (
        <>
        <Typography.Text className="original-price">¥{Number(originalPrice).toFixed(0)}</Typography.Text>
        {size != 'small' && (
          <Typography.Text className="saved-amount">节省¥{Number(saved).toFixed(0)}</Typography.Text>
        )}
        </>
      )}
    </Space>
  );
}
