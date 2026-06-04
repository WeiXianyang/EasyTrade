import { App, Button, Card, Form, Input, Space, Tabs, Typography } from 'antd';
import { LockOutlined, MailOutlined, PhoneOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import { useApp } from '../contexts/useApp.js';

export default function LoginPage() {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const { loginUser, registerUser } = useApp();

  const handleLogin = (values) => {
    try {
      loginUser(values.identifier, values.password);
      message.success('登录成功');
      navigate('/');
    } catch (error) {
      message.error(error.message);
    }
  };

  const handleRegister = (values) => {
    try {
      registerUser(values);
      message.success('注册成功');
      navigate('/');
    } catch (error) {
      message.error(error.message);
    }
  };

  return (
    <div style={{ maxWidth: 520, margin: '32px auto' }}>
      <Card>
        <Space orientation="vertical" size={18} style={{ width: '100%' }}>
          <div>
            <Typography.Title level={2}>用户登录 / 注册</Typography.Title>
            <Typography.Text className="muted">示例账号：buyer@example.com / 123456</Typography.Text>
          </div>
          <Tabs
            items={[
              {
                key: 'login',
                label: '登录',
                children: (
                  <Form layout="vertical" onFinish={handleLogin}>
                    <Form.Item name="identifier" label="邮箱 / 手机 / 用户名" rules={[{ required: true, message: '请输入账号' }]}>
                      <Input prefix={<MailOutlined />} placeholder="buyer@example.com" />
                    </Form.Item>
                    <Form.Item name="password" label="密码" rules={[{ required: true, message: '请输入密码' }]}>
                      <Input.Password prefix={<LockOutlined />} placeholder="123456" />
                    </Form.Item>
                    <Button block type="primary" htmlType="submit">
                      登录
                    </Button>
                  </Form>
                ),
              },
              {
                key: 'register',
                label: '注册',
                children: (
                  <Form layout="vertical" onFinish={handleRegister}>
                    <Form.Item name="username" label="用户名" rules={[{ required: true, message: '请输入用户名' }]}>
                      <Input prefix={<UserOutlined />} placeholder="easybuyer" />
                    </Form.Item>
                    <Form.Item name="name" label="姓名" rules={[{ required: true, message: '请输入姓名' }]}>
                      <Input placeholder="张三" />
                    </Form.Item>
                    <Form.Item name="email" label="邮箱" rules={[{ required: true, type: 'email', message: '请输入有效邮箱' }]}>
                      <Input prefix={<MailOutlined />} placeholder="you@example.com" />
                    </Form.Item>
                    <Form.Item name="phone" label="手机号" rules={[{ required: true, pattern: /^1\d{10}$/, message: '请输入 11 位手机号' }]}>
                      <Input prefix={<PhoneOutlined />} placeholder="13800000000" />
                    </Form.Item>
                    <Form.Item name="address" label="默认地址" rules={[{ required: true, message: '请输入收货地址' }]}>
                      <Input placeholder="北京市海淀区学院路 1 号" />
                    </Form.Item>
                    <Form.Item name="password" label="密码" rules={[{ required: true, min: 6, message: '密码至少 6 位' }]}>
                      <Input.Password prefix={<LockOutlined />} />
                    </Form.Item>
                    <Button block type="primary" htmlType="submit">
                      注册并登录
                    </Button>
                  </Form>
                ),
              },
            ]}
          />
        </Space>
      </Card>
    </div>
  );
}
