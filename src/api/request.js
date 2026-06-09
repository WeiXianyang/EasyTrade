/**
 * src/api/request.js —— Axios 封装实例
 *
 * 统一配置 baseURL、超时时间、请求/响应拦截器。
 * 当前项目使用 localStorage 模拟后端，此实例作为工程化规范示范；
 * 接入真实后端时，将 baseURL 改为 VITE_API_BASE_URL 即可。
 *
 * 请求拦截器：自动注入 Authorization Token（从 sessionStorage 读取）
 * 响应拦截器：统一处理 401（跳转登录）和其他 HTTP 错误
 */
import axios from 'axios';

// 从环境变量读取接口基础地址，开发/生产分别在 .env.development / .env.production 配置
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const TIMEOUT  = Number(import.meta.env.VITE_API_TIMEOUT) || 10000;

const request = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── 请求拦截器 ────────────────────────────────────────────────────────────────
request.interceptors.request.use(
  (config) => {
    // 从 sessionStorage 读取 token，注入到请求头
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ─── 响应拦截器 ────────────────────────────────────────────────────────────────
request.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      // Token 过期或未登录，清除本地信息并跳转登录页
      sessionStorage.removeItem('token');
      window.location.href = '/login';
      return Promise.reject(new Error('登录已过期，请重新登录'));
    }

    if (status === 403) {
      return Promise.reject(new Error('无权限执行该操作'));
    }

    if (status === 404) {
      return Promise.reject(new Error('请求的资源不存在'));
    }

    if (status >= 500) {
      return Promise.reject(new Error('服务器异常，请稍后再试'));
    }

    // 网络错误（超时、断网等）
    if (!error.response) {
      return Promise.reject(new Error('网络异常，请检查网络连接'));
    }

    return Promise.reject(error);
  },
);

export default request;
