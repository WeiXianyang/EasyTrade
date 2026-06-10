import { Space, Typography } from 'antd';

export default function PriceText({ price, originalPrice, size = 'default' }) {
  const saved = originalPrice > price ? originalPrice - price : 0;
  const priceFontSize = size === 'large' ? 28 : size === 'small' ? 15 : 18;
  return (
    <Space className={`price-text price-text-${size}`} size={size === 'small' ? 4 : 8} align="baseline">
      <Typography.Text className="price" style={{ fontSize: priceFontSize }}>
        ¥{Number(price).toFixed(0)}
      </Typography.Text>
      {originalPrice > price && (
        <>
          <Typography.Text className="original-price">¥{Number(originalPrice).toFixed(0)}</Typography.Text>
          {size !== 'small' && (
            <Typography.Text className="saved-amount">节省¥{Number(saved).toFixed(0)}</Typography.Text>
          )}
        </>
      )}
    </Space>
  );
}
