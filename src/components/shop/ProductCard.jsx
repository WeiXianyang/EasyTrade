import { memo } from 'react';
import { useNavigate } from 'react-router-dom';

import PriceText from './PriceText.jsx';
import './ProductCard.css';  // ← 引入组件专属 CSS

/**
 * ProductCard —— 商品卡片
 *
 * 使用 React.memo 避免父组件无关状态更新时重渲染。
 * props 均为基本类型或稳定引用，配合父组件 useCallback/useMemo 效果最佳。
 *
 * @param {object}   product     商品对象
 * @param {Function} onAddCart   加购回调（由 useAddToCart 提供的稳定引用）
 * @param {number}   [rank]      排行名次（1-3 显示徽章）
 * @param {boolean}  [showSold]  是否显示销量
 */
const ProductCard = memo(function ProductCard({ product, onAddCart, rank, showSold }) {
  const navigate = useNavigate();

  const discount = product.originalPrice > product.price
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;
  const isSoldOut = product.stock === 0;

  return (
    <div className={`product-new-card${isSoldOut ? ' sold-out' : ''}`}>
      {/* 图片区 */}
      <div className="product-new-card-img" onClick={() => navigate(`/detail/${product.id}`)}>
        {rank !== undefined && rank <= 3 && (
          <span className={`product-new-rank-badge rank-${rank}`}>
            {rank}
          </span>
        )}
        {discount > 0 && <span className="discount-badge">-{discount}%</span>}
        {isSoldOut && <div className="product-new-sold-out">已售罄</div>}
        <img src={product.image} alt={product.name} />
      </div>

      {/* 信息区 */}
      <div className="product-new-card-info">
        <p className="product-new-card-name" title={product.name}>
          {product.name}
        </p>
        <p className="product-new-card-desc" title={product.subtitle}>
          {product.subtitle}
          {showSold && ` · 已售 ${product.sold}`}
        </p>
        {product.stock > 0 && product.stock <= 10 && (
          <p className="product-new-card-stock-warn">仅剩 {product.stock} 件</p>
        )}
      </div>

      {/* 底部 */}
      <div className="product-new-card-footer">
        <span className="product-new-card-price">
          <PriceText price={product.price} originalPrice={product.originalPrice} size="small" />
        </span>
        <button
          type="button"
          className="product-new-card-cart-btn"
          disabled={isSoldOut}
          onClick={() => onAddCart(product)}
          title={isSoldOut ? '商品已售罄' : '加入购物车'}
        >
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path d="M17.72,5.011H8.026c-0.271,0-0.49,0.219-0.49,0.489c0,0.271,0.219,0.489,0.49,0.489h8.962l-1.979,4.773H6.763L4.935,5.343C4.926,5.316,4.897,5.309,4.884,5.286c-0.011-0.024,0-0.051-0.017-0.074C4.833,5.166,4.025,4.081,2.33,3.908C2.068,3.883,1.822,4.075,1.795,4.344C1.767,4.612,1.962,4.853,2.231,4.88c1.143,0.118,1.703,0.738,1.808,0.866l1.91,5.661c0.066,0.199,0.252,0.333,0.463,0.333h8.924c0.116,0,0.22-0.053,0.308-0.128c0.027-0.023,0.042-0.048,0.063-0.076c0.026-0.034,0.063-0.058,0.08-0.099l2.384-5.75c0.062-0.151,0.046-0.323-0.045-0.458C18.036,5.092,17.883,5.011,17.72,5.011z" />
            <path d="M8.251,12.386c-1.023,0-1.856,0.834-1.856,1.856s0.833,1.853,1.856,1.853c1.021,0,1.853-0.83,1.853-1.853S9.273,12.386,8.251,12.386z M8.251,15.116c-0.484,0-0.877-0.393-0.877-0.874c0-0.484,0.394-0.878,0.877-0.878c0.482,0,0.875,0.394,0.875,0.878C9.126,14.724,8.733,15.116,8.251,15.116z" />
            <path d="M13.972,12.386c-1.022,0-1.855,0.834-1.855,1.856s0.833,1.853,1.855,1.853s1.854-0.83,1.854-1.853S14.994,12.386,13.972,12.386z M13.972,15.116c-0.484,0-0.878-0.393-0.878-0.874c0-0.484,0.394-0.878,0.878-0.878c0.482,0,0.875,0.394,0.875,0.878C14.847,14.724,14.454,15.116,13.972,15.116z" />
          </svg>
        </button>
      </div>
    </div>
  );
});

export default ProductCard;
