import { LoginOutlined } from '@ant-design/icons';
import './LogoutBtn.css';

export default function LogoutBtn({ onClick }) {
  return (
    <button className="logout-btn" onClick={onClick} aria-label="退出登录">
      <span className="logout-icon-wrap">
        <LoginOutlined />
      </span>
      <span className="logout-text">退出</span>
    </button>
  );
}
