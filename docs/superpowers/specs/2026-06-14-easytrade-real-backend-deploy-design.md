# EasyTrade Real Backend Deployment Design

## Goal

Deploy EasyTrade as an independent production project at `https://www.helvzn.com/easytrade`, replacing the current localStorage/mock backend with a real backend, database persistence, and Alibaba Cloud SMS verification-code login.

This project is independent from BSCM and mootai. It uses its own source tree, backend service name, database, deployment directory, Nginx route, and runtime environment variables.

## Architecture

EasyTrade will keep the existing React + Ant Design frontend experience and add a new Spring Boot backend under this repository. The frontend will move domain mutations and reads from synchronous localStorage services to async API services while keeping local-only UI preferences such as theme in browser storage.

The backend will expose REST APIs under `/api`, persist business data in PostgreSQL, issue JWT sessions, and call Alibaba Cloud SMS from the server for verification-code flows. In production, Nginx will publish the frontend under `/easytrade/` and reverse-proxy `/easytrade/api/` to the backend process on localhost.

## Production Boundaries

- Public site: `https://www.helvzn.com/easytrade`
- Public API prefix: `https://www.helvzn.com/easytrade/api`
- Backend localhost port: `8010`
- Backend service name: `easytrade-backend`
- Backend deployment directory: `/opt/easytrade/app`
- Frontend deployment directory: `/opt/easytrade/web`
- Database name: `easytrade_db`
- Database user: `easytrade`

No EasyTrade runtime should depend on BSCM service names, BSCM database names, or `/mootai` routes.

## Backend Components

### Core Stack

- Java 17
- Spring Boot 3
- Spring Web
- Spring Security
- Spring Data JPA
- PostgreSQL
- JWT
- Alibaba Cloud Dysmsapi SDK

### Domain Model

The backend will persist the current mock data model:

- Users: customers, admins, and operators.
- Categories: id, name, description.
- Products: catalog fields, category relation, stock, sold count, status, image, tags, description.
- Carts: per-user product rows with quantity and selected state.
- Orders: order lifecycle, address snapshot, line-item snapshots, logistics traces.
- Role permissions: editable module access for `admin` and `operator`.
- Request logs: endpoint, method, status, duration, actor, module, error.
- Audit logs: actor, module, action, target, status, detail.
- User activity: favorites, followed categories, footprints.
- Verification codes: phone, code hash or code, expiration, used state.

Seed data will mirror the existing demo data so current demo accounts and walkthroughs continue to work after migration.

### Auth And Sessions

Customer login/register will support:

- Password login by username, email, or phone.
- Registration with phone verification code.
- Verification-code login by phone.
- Session restore through JWT.

Admin login will support:

- Password login for `admin` and `operator`.
- JWT sessions with role claims.
- Module access checks on admin APIs.

The frontend should store only token and safe user/admin snapshots. Password hashes and verification codes remain server-side.

### SMS Verification

The backend will call Alibaba Cloud SMS only from the server. Required runtime configuration:

- `ALIBABA_CLOUD_ACCESS_KEY_ID`
- `ALIBABA_CLOUD_ACCESS_KEY_SECRET`
- `EASYTRADE_SMS_SIGN_NAME`
- `EASYTRADE_SMS_TEMPLATE_CODE`
- `EASYTRADE_SMS_REGION`

The repository will include `.env.example` or deployment examples with variable names only. Real credentials must be configured on the server through environment variables or a systemd environment file.

### API Surface

Initial REST groups:

- `/api/auth`: send code, register, password login, code login, me, logout-compatible response.
- `/api/products`: shop catalog and product detail.
- `/api/admin/products`: product CRUD and status changes.
- `/api/categories`: category listing.
- `/api/admin/categories`: category CRUD with product-association guard.
- `/api/cart`: cart listing, add, update quantity, select, select all, remove, remove selected.
- `/api/orders`: create, list current user orders, detail, pay, finish.
- `/api/admin/orders`: list all orders, ship order.
- `/api/admin/permissions`: module list, role permissions, update, reset.
- `/api/admin/request-logs`: list and clear request logs.
- `/api/admin/audit-logs`: list and clear audit logs.
- `/api/demo/reset`: reset demo data while preserving the current admin session.
- `/api/activity`: favorites, follows, footprints, and toggles.

Responses will use a small consistent envelope:

```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

## Frontend Migration

The React UI will remain the primary interface. The migration will replace direct localStorage-backed domain services with async API-backed services:

- `AppProvider` becomes async-aware for login, session restore, and cart count refresh.
- Pages that currently call `productService`, `cartService`, `orderService`, `authService`, `permissionService`, request logs, and audit logs will call API services.
- Route guards will rely on the stored token plus restored user/admin data.
- Demo account text can remain, but real login will happen through backend APIs.
- Frontend production base path will be `/easytrade/`.
- Frontend API base path will be `/easytrade/api` in production and `/api` in local dev.

The existing localStorage services may remain for tests during transition, but production code paths should use the backend API.

## Deployment

### Build Outputs

- Backend: `backend/target/easytrade-backend-1.0.0.jar`
- Frontend: `dist/` from `npm run build`

### systemd

Create a dedicated `easytrade-backend.service`:

- Runs as `mjh` or a dedicated `easytrade` user.
- Working directory: `/opt/easytrade/app`
- Executes the EasyTrade backend jar.
- Loads database, JWT, and Alibaba Cloud SMS values from a server-only environment file.
- Restarts automatically on failure.

### Nginx

Add independent routes on `www.helvzn.com`:

```nginx
location /easytrade/api/ {
    proxy_pass http://127.0.0.1:8010/api/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

location /easytrade/ {
    alias /opt/easytrade/web/;
    try_files $uri $uri/ /easytrade/index.html;
}
```

The exact Nginx file will be verified on the server before editing so existing routes for other projects stay intact.

## Error Handling

- Backend validation errors return `400` with readable Chinese messages.
- Authentication failures return `401`.
- Permission failures return `403`.
- Not found domain resources return `404`.
- Server errors return `500` and are recorded in request logs.
- Admin mutations create audit logs for success and failure where applicable.
- SMS failures do not expose provider secrets and return a user-facing retry message.

## Testing Strategy

Backend tests:

- Auth password login, registration, verification-code login, and invalid code.
- Product/category CRUD, category delete guard.
- Cart merge, quantity, selection, removal.
- Order create, pay, ship, finish.
- Role permission update and admin safeguards.
- Request/audit log recording.
- Demo reset.

Frontend tests:

- API client paths honor `/easytrade/api` production prefix.
- Auth flows store token and safe snapshots.
- Core pages call API services instead of mock services.
- Admin permissions still hide inaccessible modules.

Build checks:

- `npm test`
- `npm run lint`
- `npm run build`
- `mvn test`
- `mvn package`

Deployment checks:

- `curl https://www.helvzn.com/easytrade/`
- `curl https://www.helvzn.com/easytrade/api/products`
- Browser smoke test for shop login, add-to-cart, checkout, admin login, product edit, order ship.

## Rollout Plan

1. Add backend skeleton, config, schema, seed data, and tests.
2. Implement backend domain APIs with TDD.
3. Add frontend API services and migrate auth/session first.
4. Migrate catalog, cart, order, admin, logs, and activity pages.
5. Add build and deployment assets.
6. Verify locally.
7. Deploy to the server under `/easytrade`.
8. Run production smoke tests and inspect service logs.

## Open Decisions

- Use `/easytrade` path on `www.helvzn.com`, not a separate DNS subdomain, because the user requested an example URL in that form.
- Use PostgreSQL because the production server already supports the Java/PostgreSQL deployment style and it is suitable for the full business model.
- Preserve current demo accounts after migration unless the user asks to remove them.
