import { App, Button, Form, Input } from 'antd';
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { useApp } from '../../contexts/useApp.js';
import '../LoginPage.css';          

export default function AdminLoginPage({ dashboardPath = '/admin', shopUrl = '/' }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { message } = App.useApp();
  const { acceptAdminHandoff, loginAdmin } = useApp();

  useEffect(() => {
    const handoff = searchParams.get('handoff');
    if (!handoff) {
      return;
    }

    try {
      const admin = JSON.parse(decodeURIComponent(handoff));
      if (!['admin', 'operator'].includes(admin.role)) {
        throw new Error('无效的后台身份');
      }
      const acceptedAdmin = acceptAdminHandoff(admin);
      message.success(`欢迎进入后台，${acceptedAdmin.name}`);
      navigate(dashboardPath, { replace: true });
    } catch (error) {
      message.error(error.message || '后台登录交接失败');
    }
  }, [acceptAdminHandoff, dashboardPath, message, navigate, searchParams]);

  const handleLogin = (values) => {
    try {
      const admin = loginAdmin(values.username, values.password);
      message.success(`欢迎进入后台，${admin.name}`);
      navigate(dashboardPath);
    } catch (error) {
      message.error(error.message);
    }
  };

  return (
    <div className="login-page">                          
      <div className="login-form-container">              
        <p className="login-title">EasyTrade 后台</p>     
        <p className="login-subtitle">管理员 / 运营 登录入口</p>

        <Form
          className="login-form"                          
          layout="vertical"
          onFinish={handleLogin}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入后台账号' }]}
          >
            <Input  placeholder="后台账号" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password placeholder="密码" />
          </Form.Item>

          <button className="login-form-btn" type="submit">  {/* 复用按钮 */}
            进入后台
          </button>

          <Button
            block
            style={{ borderRadius: 8 }}
            onClick={() => {
              window.location.href = shopUrl;
            }}
          >
            返回商城
          </Button>

          <p style={{ textAlign: 'center', fontSize: 12, color: '#94a3b8', margin: '0' }}>
            管理员：admin/admin123<br />
            运营：operator/operator123
          </p>

        </Form>
      </div>
    </div>
  );
}
