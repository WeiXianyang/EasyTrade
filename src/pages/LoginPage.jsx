import { App, Form, Input, Segmented, Tabs } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';

import { useApp } from '../contexts/useApp.js';
import './LoginPage.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { message } = App.useApp();
  const { loginUser, registerUser, loginAdmin } = useApp();
  const [activeTab, setActiveTab] = useState('login');
  const [identity, setIdentity] = useState('user');

  function getAdminEntryUrl() {
    if (import.meta.env.VITE_ADMIN_ENTRY_URL) {
      return import.meta.env.VITE_ADMIN_ENTRY_URL;
    }
    return import.meta.env.DEV ? 'http://localhost:5174/admin.html#/dashboard' : '/admin.html#/dashboard';
  }

  /**
   * 登录/注册成功后跳回来源页
   * RequireUser 守卫会将来源路径写入 location.state.from
   * 若无来源（直接访问登录页），则跳首页
   */
  const redirectAfterAuth = () => {
    const from = location.state?.from?.pathname || '/';
    navigate(from, { replace: true });
  };

  const handleLogin = (values) => {
    try {
      if (identity === 'admin') {
        const admin = loginAdmin(values.identifier, values.password);
        message.success(`欢迎进入后台，${admin.name}`);
        window.location.href = getAdminEntryUrl();
        return;
      }

      loginUser(values.identifier, values.password);
      message.success('登录成功');
      redirectAfterAuth();
    } catch (error) {
      message.error(error.message);
    }
  };

  const handleRegister = (values) => {
    try {
      registerUser(values);
      message.success('注册成功');
      redirectAfterAuth();
    } catch (error) {
      message.error(error.message);
    }
  };

  const switchToRegister = () => {
    setActiveTab('register');         
  };

  const switchToLogin = () => {
    setActiveTab('login');
  };

  const adminAuthPanel = (
    <Form className="login-form" layout="vertical" onFinish={handleLogin}>
      <Form.Item name="identifier" rules={[{ required: true, message: '请输入后台账号' }]}>
        <Input placeholder="后台账号" />
      </Form.Item>
      <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
        <Input.Password placeholder="密码" />
      </Form.Item>
      <button className="login-form-btn" type="submit">进入后台</button>
      <p className="login-demo-account">
        管理员：admin/admin123<br />
        运营：operator/operator123
      </p>
    </Form>
  );

  const userAuthPanel = (
    <Tabs
      className="login-tabs"
      centered
      activeKey={activeTab}
      onChange={setActiveTab}
      items={[
        {
          key: 'login',
          label: '登录',
          children: (
            <Form
              className="login-form"
              layout="vertical"
              onFinish={handleLogin}
            >
              <Form.Item
                name="identifier"
                rules={[{ required: true, message: '请输入账号' }]}
              >
                <Input placeholder="邮箱 / 手机 / 用户名" />
              </Form.Item>
              <Form.Item
                name="password"
                rules={[{ required: true, message: '请输入密码' }]}
              >
                <Input.Password placeholder="密码" />
              </Form.Item>
              <button className="login-form-btn" type="submit">登录</button>
            </Form>
          ),
        },
        {
          key: 'register',
          label: '注册',
          children: (
            <Form
              className="login-form"
              layout="vertical"
              onFinish={handleRegister}
            >
              <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
                <Input placeholder="用户名" />
              </Form.Item>
              <Form.Item name="name" rules={[{ required: true, message: '请输入姓名' }]}>
                <Input placeholder="姓名" />
              </Form.Item>
              <Form.Item name="email" rules={[{ required: true, type: 'email', message: '请输入有效邮箱' }]}>
                <Input  placeholder="邮箱" />
              </Form.Item>
              <Form.Item name="phone" rules={[{ required: true, pattern: /^1\d{10}$/, message: '请输入 11 位手机号' }]}>
                <Input placeholder="手机号" />
              </Form.Item>
              <Form.Item name="address" rules={[{ required: true, message: '请输入收货地址' }]}>
                <Input placeholder="收货地址" />
              </Form.Item>
              <Form.Item name="password" rules={[{ required: true, min: 6, message: '密码至少 6 位' }]}>
                <Input.Password placeholder="密码" />
              </Form.Item>
              <button className="login-form-btn" type="submit">注册并登录</button>
            </Form>
          ),
        },
      ]}
    />
  );

  return (
    <div className="login-page">
      <div className="login-form-container">
        <p className="login-title">EasyTrade</p>
        <p className="login-subtitle">登录或注册你的账号</p>

        <Segmented
          block
          className="login-identity-switch"
          value={identity}
          onChange={setIdentity}
          options={[
            { label: '用户', value: 'user' },
            { label: '管理员', value: 'admin' },
          ]}
        />

        {identity === 'admin' ? adminAuthPanel : userAuthPanel}

        {/* 根据当前 tab 显示不同的提示语 */}
        {identity === 'user' && activeTab === 'login' ? (
          <p className="login-signup-label">
            还没有账号？
            <span className="login-signup-link" onClick={switchToRegister}>注册</span>
          </p>
        ) : identity === 'user' ? (
          <p className="login-signup-label">
            已有账号？
            <span className="login-signup-link" onClick={switchToLogin}>登录</span>
          </p>
        ) : null}
      </div>
    </div>
  );
}
