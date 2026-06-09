import { ShoppingCartOutlined } from '@ant-design/icons';
import './FloatingCartBtn.css';

export default function FloatingCartBtn({ onClick }) {
  return (
    <button className="floating-cart-btn" onClick={onClick} aria-label="打开购物车">
      <span className="cart-icon-wrap">
        <ShoppingCartOutlined />
      </span>
      <span className="cart-text">购物车</span>
    </button>
  );
}
