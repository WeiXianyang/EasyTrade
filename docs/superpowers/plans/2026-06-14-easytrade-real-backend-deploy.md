# EasyTrade Real Backend Deployment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace EasyTrade's localStorage/mock backend with an independent Spring Boot + PostgreSQL backend, migrate the React app to real APIs, and deploy it at `https://www.helvzn.com/easytrade`.

**Architecture:** Add an EasyTrade-owned backend under `backend/`, expose REST APIs at `/api`, persist all catalog, cart, order, auth, permission, audit, request-log, and activity data in PostgreSQL, and publish the app through Nginx at `/easytrade/` with `/easytrade/api/` proxied to `127.0.0.1:8010`. Keep the existing React UI, but replace domain service calls with async API-backed clients.

**Tech Stack:** Java 17, Spring Boot 3, Spring Security, Spring Data JPA, PostgreSQL, Alibaba Cloud Dysmsapi SDK, React 19, Vite, Axios, Ant Design, Node test runner.

---

## File Structure

- Create `backend/pom.xml`: Maven project and dependency management.
- Create `backend/src/main/java/com/easytrade/EasyTradeApplication.java`: backend entry point.
- Create `backend/src/main/resources/application.yml`: local and production-safe runtime configuration.
- Create `backend/src/main/java/com/easytrade/common/ApiResponse.java`: consistent API envelope.
- Create `backend/src/main/java/com/easytrade/common/BusinessException.java`: domain exceptions.
- Create `backend/src/main/java/com/easytrade/config/*`: security, CORS, JWT, SMS, seed-data, logging config.
- Create `backend/src/main/java/com/easytrade/entity/*`: JPA entities for all current EasyTrade data.
- Create `backend/src/main/java/com/easytrade/repository/*`: Spring Data repositories.
- Create `backend/src/main/java/com/easytrade/service/*`: domain services and SMS integration.
- Create `backend/src/main/java/com/easytrade/controller/*`: REST controllers.
- Create `backend/src/test/java/com/easytrade/*`: focused backend tests.
- Modify `src/api/request.js`: production-aware Axios base URL and token handling.
- Create `src/api/easytradeApi.js`: grouped frontend API methods.
- Modify `src/contexts/AppProvider.jsx`: async session/cart state and API-backed auth.
- Modify shop pages under `src/pages/*.jsx`: async catalog/cart/order/activity reads and mutations.
- Modify admin pages under `src/pages/admin/*.jsx` and `src/components/admin/AdminOpsTools.jsx`: async admin CRUD/log operations.
- Modify `src/router.jsx`, `src/admin-router.jsx`, `vite.config.js`, `.env.example`, `docs/ENVIRONMENT.md`: `/easytrade` base path and API prefix.
- Create `deploy/easytrade-backend.service`, `deploy/nginx-easytrade.conf`, `deploy/deploy-easytrade.sh`: independent deployment assets.

---

### Task 1: Backend Skeleton And Configuration

**Files:**
- Create: `backend/pom.xml`
- Create: `backend/src/main/java/com/easytrade/EasyTradeApplication.java`
- Create: `backend/src/main/resources/application.yml`
- Create: `backend/src/main/java/com/easytrade/common/ApiResponse.java`
- Create: `backend/src/main/java/com/easytrade/common/BusinessException.java`
- Test: `backend/src/test/java/com/easytrade/EasyTradeApplicationTests.java`

- [ ] **Step 1: Write the failing backend context test**

```java
package com.easytrade;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class EasyTradeApplicationTests {
  @Test
  void contextLoads() {}
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `mvn -f backend/pom.xml test -Dtest=EasyTradeApplicationTests`
Expected: FAIL because `backend/pom.xml` and application classes do not exist.

- [ ] **Step 3: Add Maven and application skeleton**

Create a Spring Boot 3.2 project with Java 17, Web, Security, Validation, Data JPA, PostgreSQL, H2 test dependency, JWT, Alibaba Cloud SMS SDK, and Spring Boot Test. `application.yml` must use port `8010`, datasource env vars, JWT env vars, and SMS env vars with empty defaults for secrets.

- [ ] **Step 4: Run test to verify it passes**

Run: `mvn -f backend/pom.xml test -Dtest=EasyTradeApplicationTests`
Expected: PASS.

---

### Task 2: Auth, SMS, Security, And Seed Users

**Files:**
- Create: `backend/src/main/java/com/easytrade/config/SecurityConfig.java`
- Create: `backend/src/main/java/com/easytrade/config/JwtService.java`
- Create: `backend/src/main/java/com/easytrade/config/JwtAuthenticationFilter.java`
- Create: `backend/src/main/java/com/easytrade/config/SmsProperties.java`
- Create: `backend/src/main/java/com/easytrade/entity/User.java`
- Create: `backend/src/main/java/com/easytrade/entity/VerificationCode.java`
- Create: `backend/src/main/java/com/easytrade/repository/UserRepository.java`
- Create: `backend/src/main/java/com/easytrade/repository/VerificationCodeRepository.java`
- Create: `backend/src/main/java/com/easytrade/service/AuthService.java`
- Create: `backend/src/main/java/com/easytrade/service/SmsService.java`
- Create: `backend/src/main/java/com/easytrade/controller/AuthController.java`
- Test: `backend/src/test/java/com/easytrade/AuthServiceTests.java`

- [ ] **Step 1: Write failing auth tests**

Test password login for `buyer@example.com / 123456`, admin login for `admin / admin123`, duplicate register rejection, verification-code login with a stored valid code, and invalid code rejection.

- [ ] **Step 2: Run test to verify it fails**

Run: `mvn -f backend/pom.xml test -Dtest=AuthServiceTests`
Expected: FAIL because auth classes are missing.

- [ ] **Step 3: Implement auth services**

Implement BCrypt password hashes, safe user DTOs, JWT generation, public `/api/auth/send-code`, `/register`, `/login`, `/code-login`, `/admin/login`, and authenticated `/me` endpoints. In tests, inject a fake SMS sender so tests do not call Alibaba Cloud.

- [ ] **Step 4: Run auth tests**

Run: `mvn -f backend/pom.xml test -Dtest=AuthServiceTests`
Expected: PASS.

---

### Task 3: Catalog And Category APIs

**Files:**
- Create: `backend/src/main/java/com/easytrade/entity/Category.java`
- Create: `backend/src/main/java/com/easytrade/entity/Product.java`
- Create: `backend/src/main/java/com/easytrade/repository/CategoryRepository.java`
- Create: `backend/src/main/java/com/easytrade/repository/ProductRepository.java`
- Create: `backend/src/main/java/com/easytrade/service/CatalogService.java`
- Create: `backend/src/main/java/com/easytrade/controller/CatalogController.java`
- Create: `backend/src/main/java/com/easytrade/controller/AdminCatalogController.java`
- Test: `backend/src/test/java/com/easytrade/CatalogServiceTests.java`

- [ ] **Step 1: Write failing catalog tests**

Cover visible product filtering, hot products, admin product visibility, product CRUD, status toggle, category CRUD, duplicate category names, and category delete guard when products exist.

- [ ] **Step 2: Run test to verify it fails**

Run: `mvn -f backend/pom.xml test -Dtest=CatalogServiceTests`
Expected: FAIL because catalog classes are missing.

- [ ] **Step 3: Implement catalog entities and APIs**

Mirror the existing `seedProducts` and `seedCategories`, including stable IDs, product tags, stock, sold count, on/off status, image, and description. Public APIs must only expose purchasable products unless a detail endpoint is requested.

- [ ] **Step 4: Run catalog tests**

Run: `mvn -f backend/pom.xml test -Dtest=CatalogServiceTests`
Expected: PASS.

---

### Task 4: Cart And Order APIs

**Files:**
- Create: `backend/src/main/java/com/easytrade/entity/CartItem.java`
- Create: `backend/src/main/java/com/easytrade/entity/Order.java`
- Create: `backend/src/main/java/com/easytrade/entity/OrderItem.java`
- Create: `backend/src/main/java/com/easytrade/entity/LogisticsTrace.java`
- Create: `backend/src/main/java/com/easytrade/repository/CartItemRepository.java`
- Create: `backend/src/main/java/com/easytrade/repository/OrderRepository.java`
- Create: `backend/src/main/java/com/easytrade/service/CartService.java`
- Create: `backend/src/main/java/com/easytrade/service/OrderService.java`
- Create: `backend/src/main/java/com/easytrade/controller/CartController.java`
- Create: `backend/src/main/java/com/easytrade/controller/OrderController.java`
- Create: `backend/src/main/java/com/easytrade/controller/AdminOrderController.java`
- Test: `backend/src/test/java/com/easytrade/CartOrderServiceTests.java`

- [ ] **Step 1: Write failing cart/order tests**

Cover cart quantity merge, stock limits, selected summaries, remove selected, create order from selected cart items, buy-now order creation, pay, admin ship, finish, and immutable order item snapshots.

- [ ] **Step 2: Run test to verify it fails**

Run: `mvn -f backend/pom.xml test -Dtest=CartOrderServiceTests`
Expected: FAIL because cart/order classes are missing.

- [ ] **Step 3: Implement cart/order services**

Use authenticated user ID from JWT for customer cart/order APIs. Admin order APIs require admin role for shipping. Order creation copies product name, price, image, and quantity into order items.

- [ ] **Step 4: Run cart/order tests**

Run: `mvn -f backend/pom.xml test -Dtest=CartOrderServiceTests`
Expected: PASS.

---

### Task 5: Admin Permissions, Logs, Activity, And Demo Reset

**Files:**
- Create: `backend/src/main/java/com/easytrade/entity/RolePermission.java`
- Create: `backend/src/main/java/com/easytrade/entity/RequestLog.java`
- Create: `backend/src/main/java/com/easytrade/entity/AuditLog.java`
- Create: `backend/src/main/java/com/easytrade/entity/Favorite.java`
- Create: `backend/src/main/java/com/easytrade/entity/CategoryFollow.java`
- Create: `backend/src/main/java/com/easytrade/entity/Footprint.java`
- Create: `backend/src/main/java/com/easytrade/service/AdminOpsService.java`
- Create: `backend/src/main/java/com/easytrade/service/ActivityService.java`
- Create: `backend/src/main/java/com/easytrade/service/DemoResetService.java`
- Create: `backend/src/main/java/com/easytrade/controller/AdminOpsController.java`
- Create: `backend/src/main/java/com/easytrade/controller/ActivityController.java`
- Test: `backend/src/test/java/com/easytrade/AdminOpsServiceTests.java`

- [ ] **Step 1: Write failing admin/activity tests**

Cover admin permission safeguards, request log recording, audit log recording, clearing logs, favorite toggle, category follow toggle, footprint dedupe, and demo reset preserving the current admin identity.

- [ ] **Step 2: Run test to verify it fails**

Run: `mvn -f backend/pom.xml test -Dtest=AdminOpsServiceTests`
Expected: FAIL because admin ops classes are missing.

- [ ] **Step 3: Implement admin ops services**

Keep module keys `dashboard`, `products`, `categories`, `orders`, `roles`. Preserve admin safeguard modules `dashboard` and `roles`. Request/audit logs should be capped at 80 newest rows.

- [ ] **Step 4: Run admin ops tests**

Run: `mvn -f backend/pom.xml test -Dtest=AdminOpsServiceTests`
Expected: PASS.

---

### Task 6: Frontend API Client And Session State

**Files:**
- Modify: `src/api/request.js`
- Create: `src/api/easytradeApi.js`
- Modify: `src/contexts/AppProvider.jsx`
- Modify: `src/components/RouteGuards.jsx`
- Test: `tests/api-client.test.js`

- [ ] **Step 1: Write failing frontend API tests**

Test that production base path can be `/easytrade/api`, token is read from `localStorage.easytrade.token`, API responses unwrap `data`, and 401 clears token.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test tests/api-client.test.js`
Expected: FAIL because API client does not expose the required behavior.

- [ ] **Step 3: Implement API client and async AppProvider**

Add grouped API methods for auth, products, categories, cart, orders, admin, logs, activity, and demo reset. `AppProvider` should restore sessions from token, expose async login/register/admin login/logout methods, refresh cart count from `/cart/summary`, and keep theme local.

- [ ] **Step 4: Run frontend API tests**

Run: `npm test tests/api-client.test.js`
Expected: PASS.

---

### Task 7: Frontend Shop Page Migration

**Files:**
- Modify: `src/pages/HomePage.jsx`
- Modify: `src/pages/CategoryPage.jsx`
- Modify: `src/pages/ProductDetailPage.jsx`
- Modify: `src/pages/CartPage.jsx`
- Modify: `src/pages/CheckoutPage.jsx`
- Modify: `src/pages/PayPage.jsx`
- Modify: `src/pages/OrderListPage.jsx`
- Modify: `src/pages/OrderDetailPage.jsx`
- Modify: `src/pages/MePage.jsx`
- Modify: `src/hooks/useAddToCart.js`
- Modify: `src/layouts/ShopLayout.jsx`
- Test: `tests/shop-api-migration.test.js`

- [ ] **Step 1: Write failing shop migration tests**

Check that migrated shop files import `easytradeApi` instead of `mockApiService` for production mutations and no longer render localStorage-specific copy in the footer.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test tests/shop-api-migration.test.js`
Expected: FAIL before page migration.

- [ ] **Step 3: Migrate shop pages to async API calls**

Use loading states for lists/details, show Ant Design error messages on failed mutations, reload affected data after writes, and keep existing layout text and interactions.

- [ ] **Step 4: Run shop migration tests**

Run: `npm test tests/shop-api-migration.test.js`
Expected: PASS.

---

### Task 8: Frontend Admin Page Migration

**Files:**
- Modify: `src/pages/LoginPage.jsx`
- Modify: `src/pages/admin/AdminLoginPage.jsx`
- Modify: `src/pages/admin/AdminDashboardPage.jsx`
- Modify: `src/pages/admin/AdminProductsPage.jsx`
- Modify: `src/pages/admin/AdminCategoriesPage.jsx`
- Modify: `src/pages/admin/AdminOrdersPage.jsx`
- Modify: `src/pages/admin/AdminRolesPage.jsx`
- Modify: `src/components/admin/AdminOpsTools.jsx`
- Modify: `src/layouts/AdminLayout.jsx`
- Test: `tests/admin-api-migration.test.js`

- [ ] **Step 1: Write failing admin migration tests**

Check that admin pages use API methods for product/category/order/permission/log/demo operations and preserve role-based menu behavior.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test tests/admin-api-migration.test.js`
Expected: FAIL before admin migration.

- [ ] **Step 3: Migrate admin pages**

Use async API calls, loading states, current admin token/session, admin-only shipping, operator read-only restrictions, and existing Ant Design forms/tables.

- [ ] **Step 4: Run admin migration tests**

Run: `npm test tests/admin-api-migration.test.js`
Expected: PASS.

---

### Task 9: `/easytrade` Build And Deployment Assets

**Files:**
- Modify: `vite.config.js`
- Modify: `.env.example`
- Modify: `docs/ENVIRONMENT.md`
- Create: `deploy/easytrade-backend.service`
- Create: `deploy/nginx-easytrade.conf`
- Create: `deploy/deploy-easytrade.sh`
- Test: `tests/deploy-config.test.js`

- [ ] **Step 1: Write failing deployment config tests**

Check Vite base path support, env docs for `VITE_APP_BASE_PATH` and `VITE_API_BASE_URL`, service name `easytrade-backend`, port `8010`, `/opt/easytrade`, and Nginx `/easytrade/api/`.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test tests/deploy-config.test.js`
Expected: FAIL before deployment assets exist.

- [ ] **Step 3: Implement deployment assets**

Configure Vite with `base: env.VITE_APP_BASE_PATH || '/'`, router basename, production API URL `/easytrade/api`, service file with environment placeholders, and a deployment script that builds frontend/backend and copies artifacts without storing credentials.

- [ ] **Step 4: Run deployment config tests**

Run: `npm test tests/deploy-config.test.js`
Expected: PASS.

---

### Task 10: Full Local Verification

**Files:**
- No new files expected.

- [ ] **Step 1: Run backend tests**

Run: `mvn -f backend/pom.xml test`
Expected: PASS.

- [ ] **Step 2: Run backend package**

Run: `mvn -f backend/pom.xml package`
Expected: PASS and `backend/target/easytrade-backend-1.0.0.jar` exists.

- [ ] **Step 3: Run frontend tests**

Run: `npm test`
Expected: PASS.

- [ ] **Step 4: Run frontend lint**

Run: `npm run lint`
Expected: PASS.

- [ ] **Step 5: Run frontend build**

Run: `npm run build`
Expected: PASS and `dist/` contains `index.html`, `admin.html`, and assets.

---

### Task 11: Server Deployment And Smoke Test

**Files:**
- Server-only changes under `/opt/easytrade`, systemd, and Nginx.

- [ ] **Step 1: Connect to server without writing secrets to repo**

Use SSH automation or an interactive-safe client with the provided credentials. Do not commit or upload password files.

- [ ] **Step 2: Provision database and directories**

Create `easytrade_db`, user `easytrade`, `/opt/easytrade/app`, `/opt/easytrade/web`, and a server-only environment file containing database, JWT, and Alibaba Cloud SMS variables.

- [ ] **Step 3: Upload artifacts and install service**

Upload backend jar, frontend `dist/`, `easytrade-backend.service`, and Nginx route. Enable and restart `easytrade-backend`; reload Nginx after `nginx -t`.

- [ ] **Step 4: Run production smoke commands**

Run:

```bash
curl -I https://www.helvzn.com/easytrade/
curl https://www.helvzn.com/easytrade/api/products
systemctl status easytrade-backend --no-pager
journalctl -u easytrade-backend -n 80 --no-pager
```

Expected: frontend returns HTTP 200, products API returns seeded products, service is active, logs show no startup failures.

- [ ] **Step 5: Browser smoke test**

Open the site and verify shop home, login, cart, checkout, admin login, product edit, and order shipping using the deployed URL.

