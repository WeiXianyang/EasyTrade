import { App, Button, Card, Form, Input, Space, Typography } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import { useApp } from '../../contexts/useApp.js';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const { loginAdmin } = useApp();

  const handleLogin = (values) => {
    try {
      const admin = loginAdmin(values.username, values.password);
      message.success(`欢迎进入后台，${admin.name}`);
      navigate('/admin');
    } catch (error) {
      message.error(error.message);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <Card style={{ width: 'min(420px, 100%)' }}>
        <Space orientation="vertical" size={18} style={{ width: '100%' }}>
          <div>
            <Typography.Title level={2}>EasyTrade 后台登录</Typography.Title>
            <Typography.Text className="muted">管理员：admin/admin123；运营：operator/operator123</Typography.Text>
          </div>
          <Form layout="vertical" onFinish={handleLogin}>
            <Form.Item name="username" label="后台账号" rules={[{ required: true, message: '请输入后台账号' }]}>
              <Input prefix={<UserOutlined />} placeholder="admin" />
            </Form.Item>
            <Form.Item name="password" label="密码" rules={[{ required: true, message: '请输入密码' }]}>
              <Input.Password prefix={<LockOutlined />} placeholder="admin123" />
            </Form.Item>
            <Button block type="primary" htmlType="submit">
              进入后台
            </Button>
            <Button block style={{ marginTop: 12 }} onClick={() => navigate('/')}>
              返回商城
            </Button>
          </Form>
        </Space>
      </Card>
    </div>
  );
}
