import { CustomerServiceOutlined } from '@ant-design/icons';
import './FloatingSupportBtn.css';

export default function FloatingSupportBtn({ onClick }) {
  return (
    <button className="floating-support-btn" onClick={onClick} aria-label="打开智能客服">
      <span className="support-icon-wrap">
        <CustomerServiceOutlined />
      </span>
      <span className="support-text">智能客服</span>
    </button>
  );
}
