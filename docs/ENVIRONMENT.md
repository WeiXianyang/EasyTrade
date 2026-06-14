# EasyTrade 环境变量说明

本项目使用 Vite 环境变量配置前端入口和本地开发代理，后端生产密钥通过服务器环境文件配置。请复制 `.env.example` 为 `.env.local` 后按需填写，`.env.local` 只保留在本机，不要提交到仓库。

## 变量列表

| 变量名 | 用途 | 示例 |
| --- | --- | --- |
| `VITE_APP_BASE_PATH` | 前端部署子路径。本地为 `/`，生产为 `/easytrade`。 | `/easytrade` |
| `VITE_API_BASE_URL` | 前端请求后端 API 的基础路径。本地为 `/api`，生产为 `/easytrade/api`。 | `/easytrade/api` |
| `VITE_DEV_API_TARGET` | Vite 开发代理目标后端。 | `http://localhost:8010` |
| `VITE_CUSTOM_HOST` | OpenAI 兼容客服接口地址。未配置或请求失败时，智能客服会使用本地商品推荐兜底。 | `https://example-chat-host/v1` |
| `VITE_CUSTOM_KEY` | 客服接口密钥。该值属于本地密钥，不要提交。 | `sk-...` |
| `VITE_CUSTOM_MODEL` | 客服接口模型名。 | `gpt-4o-mini` |
| `VITE_ADMIN_ENTRY_URL` | 商城登录页跳转后台端时使用的入口地址。 | `http://localhost:5174/admin.html` |

## 本地使用

```bash
copy .env.example .env.local
npm run dev:shop
npm run dev:admin
```

如果只演示商城端，可以不填写 `VITE_CUSTOM_KEY`。客服会保留本地推荐能力，不会阻塞购物、下单或后台演示。

## 后端生产变量

这些变量只应写在服务器环境文件中，例如 `/opt/easytrade/env/easytrade.env`：

| 变量名 | 用途 |
| --- | --- |
| `EASYTRADE_SERVER_PORT` | 后端监听端口。 |
| `EASYTRADE_DB_URL` | PostgreSQL JDBC 地址。 |
| `EASYTRADE_DB_USERNAME` | PostgreSQL 用户名。 |
| `EASYTRADE_DB_PASSWORD` | PostgreSQL 密码。 |
| `EASYTRADE_JWT_SECRET` | JWT 签名密钥。 |
| `EASYTRADE_JWT_EXPIRATION_MS` | JWT 有效期。 |
| `ALIBABA_CLOUD_ACCESS_KEY_ID` | 阿里云 AccessKey ID。 |
| `ALIBABA_CLOUD_ACCESS_KEY_SECRET` | 阿里云 AccessKey Secret。 |
| `EASYTRADE_SMS_SIGN_NAME` | 短信签名名称。 |
| `EASYTRADE_SMS_TEMPLATE_CODE` | 短信模板 Code。 |
| `EASYTRADE_SMS_REGION` | 短信服务地域。 |

## 安全约定

- 不要提交 `.env.local`、真实 API Key、个人访问令牌或课程平台凭据。
- 前端课程演示中的客服 API Key 只能用于本地演示；真实生产短信密钥必须只放在后端服务器。
- 修改 `.env.example` 时，需要同步更新本文档和相关测试。
