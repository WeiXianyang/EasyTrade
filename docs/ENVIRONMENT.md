# EasyTrade 环境变量说明

本项目使用 Vite 环境变量配置本地演示能力。请复制 `.env.example` 为 `.env.local` 后按需填写，`.env.local` 只保留在本机，不要提交到仓库。

## 变量列表

| 变量名 | 用途 | 示例 |
| --- | --- | --- |
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

## 安全约定

- 不要提交 `.env.local`、真实 API Key、个人访问令牌或课程平台凭据。
- 前端课程演示中的 API Key 只能用于本地演示；真实生产环境应改为后端代理。
- 修改 `.env.example` 时，需要同步更新本文档和相关测试。
