# HighKey Admin — Generated App Documentation

This document describes the independent Next.js admin application in `highkey/admin`. It was generated from the App Router source under `highkey/admin/app/**` and the direct supporting imports needed to explain behavior. It does not replace or modify `highkey/admin/README.md`.

## 1. Purpose and scope

`highkey/admin` is a standalone Next.js administration dashboard for HighKey store operations. It provides authenticated admin screens for products, orders, collection locations, promotions, roadshow sales, and finance operations.

Evidence paths:

- App root and metadata: `highkey/admin/app/layout.tsx`
- Global styling and tokens: `highkey/admin/app/globals.css`
- Authenticated dashboard route group: `highkey/admin/app/(dashboard)/layout.tsx`
- Login page: `highkey/admin/app/login/page.tsx`
- Standalone app dependencies and scripts: `highkey/admin/package.json`

The admin app is intentionally documented as an independent app. It has its own `package.json`, Next config, TypeScript config, ESLint config, PostCSS config, App Router tree, components, hooks, API client layer, and type definitions under `highkey/admin`.

## 2. Evidence set and reading methodology

I read every file recursively under `highkey/admin/app/**` and then read the directly imported support files required to explain routing, auth, API calls, shared UI, formatting, navigation, pagination, and data shapes.

App files read:

- `highkey/admin/app/layout.tsx`
- `highkey/admin/app/globals.css`
- `highkey/admin/app/favicon.ico`
- `highkey/admin/app/login/page.tsx`
- `highkey/admin/app/(dashboard)/layout.tsx`
- `highkey/admin/app/(dashboard)/page.tsx`
- `highkey/admin/app/(dashboard)/products/page.tsx`
- `highkey/admin/app/(dashboard)/products/[id]/page.tsx`
- `highkey/admin/app/(dashboard)/orders/page.tsx`
- `highkey/admin/app/(dashboard)/orders/[id]/page.tsx`
- `highkey/admin/app/(dashboard)/locations/page.tsx`
- `highkey/admin/app/(dashboard)/promotions/page.tsx`
- `highkey/admin/app/(dashboard)/roadshow/page.tsx`
- `highkey/admin/app/(dashboard)/finance/payments/page.tsx`
- `highkey/admin/app/(dashboard)/finance/refunds/page.tsx`
- `highkey/admin/app/(dashboard)/finance/disputes/page.tsx`
- `highkey/admin/app/(dashboard)/finance/stripe-events/page.tsx`
- `highkey/admin/app/(dashboard)/finance/audit-logs/page.tsx`

Direct supporting imports read include:

- Layout and navigation: `highkey/admin/components/layout/app-shell.tsx`, `highkey/admin/components/layout/header.tsx`, `highkey/admin/components/layout/sidebar.tsx`, `highkey/admin/lib/constants/navigation.ts`
- Auth: `highkey/admin/contexts/auth-context.tsx`, `highkey/admin/lib/api/auth.ts`, `highkey/admin/lib/types/auth.ts`
- API client and domain APIs: `highkey/admin/lib/api/client.ts`, `highkey/admin/lib/api/products.ts`, `highkey/admin/lib/api/orders.ts`, `highkey/admin/lib/api/locations.ts`, `highkey/admin/lib/api/promotions.ts`, `highkey/admin/lib/api/finance.ts`
- Domain types: `highkey/admin/lib/types/common.ts`, `highkey/admin/lib/types/product.ts`, `highkey/admin/lib/types/order.ts`, `highkey/admin/lib/types/location.ts`, `highkey/admin/lib/types/promotion.ts`, `highkey/admin/lib/types/finance.ts`
- Shared UI, hooks, and formatting: `highkey/admin/hooks/use-paginated-fetch.ts`, `highkey/admin/components/ui/*`, `highkey/admin/components/shared/status-badge.tsx`, `highkey/admin/components/finance/finance-table-page.tsx`, `highkey/admin/components/products/*`, `highkey/admin/lib/utils.ts`
- App-level config: `highkey/admin/package.json`, `highkey/admin/next.config.ts`, `highkey/admin/tsconfig.json`, `highkey/admin/postcss.config.mjs`, `highkey/admin/eslint.config.mjs`

## 3. Independent app boundary and runtime

`highkey/admin` is a private Next.js app named `admin` with local scripts for `dev`, `build`, `start`, and `lint` in `highkey/admin/package.json`. Runtime dependencies include Next `16.2.6`, React `19.2.4`, React DOM `19.2.4`, `lucide-react`, `clsx`, and `tailwind-merge`.

The app does not define Next.js API routes or rewrites. `highkey/admin/next.config.ts` explicitly contains no API rewrites, and the client talks directly to `NEXT_PUBLIC_API_BASE` through `highkey/admin/lib/api/client.ts`. If `NEXT_PUBLIC_API_BASE` is not set, the default backend origin is `http://localhost:4000`.

TypeScript path aliases are local to the admin app: `@/*` resolves to `./*` inside `highkey/admin` via `highkey/admin/tsconfig.json`. This keeps imports such as `@/lib/api/orders` and `@/components/ui/button` scoped to the admin app.

## 4. App Router tree and route map

The App Router tree has one public route and one protected route group:

- Public:
  - `/login` from `highkey/admin/app/login/page.tsx`
- Protected dashboard group:
  - `/` from `highkey/admin/app/(dashboard)/page.tsx`
  - `/products` from `highkey/admin/app/(dashboard)/products/page.tsx`
  - `/products/[id]` from `highkey/admin/app/(dashboard)/products/[id]/page.tsx`
  - `/orders` from `highkey/admin/app/(dashboard)/orders/page.tsx`
  - `/orders/[id]` from `highkey/admin/app/(dashboard)/orders/[id]/page.tsx`
  - `/locations` from `highkey/admin/app/(dashboard)/locations/page.tsx`
  - `/promotions` from `highkey/admin/app/(dashboard)/promotions/page.tsx`
  - `/roadshow` from `highkey/admin/app/(dashboard)/roadshow/page.tsx`
  - `/finance/payments` from `highkey/admin/app/(dashboard)/finance/payments/page.tsx`
  - `/finance/refunds` from `highkey/admin/app/(dashboard)/finance/refunds/page.tsx`
  - `/finance/disputes` from `highkey/admin/app/(dashboard)/finance/disputes/page.tsx`
  - `/finance/stripe-events` from `highkey/admin/app/(dashboard)/finance/stripe-events/page.tsx`
  - `/finance/audit-logs` from `highkey/admin/app/(dashboard)/finance/audit-logs/page.tsx`

`highkey/admin/app/(dashboard)/layout.tsx` wraps the protected group and redirects unauthenticated users to `/login?from=<encoded-path>`. The login flow currently pushes successful logins to `/`, as implemented in `highkey/admin/contexts/auth-context.tsx`; it does not consume the `from` query parameter.

## 5. Root layout, metadata, fonts, and styling

`highkey/admin/app/layout.tsx` defines the root HTML shell, metadata, fonts, and auth provider:

- Metadata title: `HighKey Admin`
- Metadata description: `HighKey administration dashboard`
- Fonts: `Geist` and `Geist_Mono` from `next/font/google`
- Global wrapper: `<AuthProvider>{children}</AuthProvider>`
- Imported global stylesheet: `highkey/admin/app/globals.css`

`highkey/admin/app/globals.css` imports Tailwind CSS v4 and defines HighKey admin design tokens as CSS variables. The visual language is a red-on-white admin theme with tokens for canvas, surfaces, hairlines, ink colors, primary red, semantic success/warning/error, overlay, and radius values. The Tailwind `@theme inline` section maps these CSS variables to Tailwind color and font tokens used throughout the app.

The favicon is present at `highkey/admin/app/favicon.ico`.

## 6. Authentication and authorization

Authentication state is centralized in `highkey/admin/contexts/auth-context.tsx`.

Key behavior:

- `AuthProvider` calls `authApi.me()` on mount to discover the current admin session.
- `authApi.me()` maps to `GET /api/v1/admin/auth/me` in `highkey/admin/lib/api/auth.ts`.
- A `401` from `me()` clears the admin state but does not surface a visible error.
- `login(payload)` calls `POST /api/v1/admin/auth/login`, stores `res.admin`, then routes to `/` and refreshes the router.
- `logout()` calls `POST /api/v1/admin/auth/logout`, clears admin state, routes to `/login`, and refreshes.
- `isSuperAdmin` is derived from `admin?.role === "super_admin"`.

Protected access is enforced client-side in `highkey/admin/app/(dashboard)/layout.tsx`: while loading or unauthenticated, the dashboard group shows `PageLoader`; after loading, if no admin exists, it redirects to `/login?from=<current-path>`.

Super-admin-only UI actions appear in:

- `highkey/admin/app/(dashboard)/orders/[id]/page.tsx`: refund action only appears when `isSuperAdmin` and `order.paymentStatus === "paid"`.
- `highkey/admin/app/(dashboard)/finance/stripe-events/page.tsx`: failed Stripe events show a `Reprocess` button only for super admins.

## 7. API client and backend contract

All domain APIs call `apiRequest()` from `highkey/admin/lib/api/client.ts`.

Shared client behavior:

- Base origin: `NEXT_PUBLIC_API_BASE`, falling back to `http://localhost:4000`.
- Query params: `undefined`, `null`, and empty string values are omitted.
- JSON request bodies are stringified and receive `Content-Type: application/json`.
- `FormData` bodies are passed through without setting JSON content type.
- `credentials: "include"` is sent on every request, so session cookies are expected.
- Non-OK responses become `ApiError` from `highkey/admin/lib/types/common.ts`, preserving message, HTTP status, and optional parsed body.
- `204` responses return `undefined`.
- JSON responses pass through `replaceImageOrigins()`, which rewrites image URLs in fields such as `imageIds`, `customisationImageIds`, and object `url` fields to the browser `window.origin` when possible.

Domain API modules and endpoint families:

- Auth: `highkey/admin/lib/api/auth.ts` -> `/api/v1/admin/auth/*`
- Products: `highkey/admin/lib/api/products.ts` -> `/api/v1/admin/products*`
- Orders and roadshow: `highkey/admin/lib/api/orders.ts` -> `/api/v1/admin/orders*`
- Collection locations: `highkey/admin/lib/api/locations.ts` -> `/api/v1/admin/collection-locations*`
- Promotions: `highkey/admin/lib/api/promotions.ts` -> `/api/v1/admin/promotions*`
- Finance: `highkey/admin/lib/api/finance.ts` -> `/api/v1/admin/finance/*`

The app does not directly contain backend implementation. This README describes frontend behavior and expected backend payload shapes from the TypeScript types in `highkey/admin/lib/types/*`.

## 8. Shared layout, navigation, and UI primitives

Authenticated pages use `AppShell` from `highkey/admin/components/layout/app-shell.tsx`. `AppShell` waits for auth loading to finish, then renders a persistent `Sidebar`, a `Header`, and the page content area.

Navigation is declared in `highkey/admin/lib/constants/navigation.ts` and rendered by `highkey/admin/components/layout/sidebar.tsx`. The menu contains Dashboard, Products, Orders, Locations, Promotions, Roadshow, and a collapsible Finance section. Finance children are Payments, Refunds, Disputes, Stripe Events, and Audit Logs.

The header in `highkey/admin/components/layout/header.tsx` shows the page title, the current admin name or email, a `Super Admin` pill for super admins, and a sign-out button.

Shared UI primitives include:

- `Button`: variants `primary`, `secondary`, `tertiary`, `danger`, and `ghost`; supports `sm`, `md`, `lg`, and loading state.
- `Card` and `CardHeader`: bordered surface containers.
- `Input`, `Select`, `Textarea`: labeled form controls with error/hint support where implemented.
- `Modal`: client-only dialog with Escape-to-close, body scroll locking, overlay click close, and sizes `sm`, `md`, `lg`.
- `Table`, `TableHead`, `TableBody`, `TableRow`, `Th`, `Td`, `EmptyState`: responsive table and empty-state helpers.
- `PaginationBar`: previous/next controls using `Pagination` metadata.
- `JsonViewer`: collapsible JSON display with explicit `null` rendering.
- `Spinner` and `PageLoader`: loading indicators.
- `Badge`, `OrderStatusBadge`, `PaymentStatusBadge`, `ActiveBadge`: status display helpers.

Formatting helpers in `highkey/admin/lib/utils.ts` provide class merging (`cn`), `formatCents`, `formatDate`, and `formatLabel`.

## 9. Data fetching and pagination pattern

Most list pages use `usePaginatedFetch()` from `highkey/admin/hooks/use-paginated-fetch.ts`.

Behavior:

- Default page size is `20` unless a caller passes a different limit.
- State includes `data`, `pagination`, `page`, `loading`, `error`, and a `reload` function.
- Fetchers receive `{ page, limit }`.
- `ApiError` messages are shown directly; other failures become `Failed to load data`.
- Dependency arrays are used by list pages to refetch on filters, such as product type, order status, payment status, and customer email.

The generic finance table component at `highkey/admin/components/finance/finance-table-page.tsx` packages this pattern for finance lists. It supports column definitions, optional row expansion, optional order-link navigation, pagination, loading, error, and empty states.

## 10. Dashboard home

The dashboard home at `highkey/admin/app/(dashboard)/page.tsx` renders a welcome message and quick-link cards. It imports `mainNav` from `highkey/admin/lib/constants/navigation.ts` and filters out the `/` dashboard item, so the dashboard quick links mirror the primary operational routes instead of hardcoding them.

Each quick link uses the nav item icon and label, and describes the destination as `View and manage <label>`. Because the Finance nav item contains children, the dashboard card points to the Finance parent href `/finance/payments`.

## 11. Products module

Product list behavior is implemented in `highkey/admin/app/(dashboard)/products/page.tsx`.

Capabilities:

- Lists products through `productsApi.list()` from `highkey/admin/lib/api/products.ts`.
- Supports type filtering by `base` or `accessory` using `ProductType` from `highkey/admin/lib/types/product.ts`.
- Shows name, optional description, product type, formatted price, stock, customizable flag, active status, and updated date.
- Navigates row clicks to `/products/<id>`.
- Opens a `ProductForm` modal for creating products.

Product detail behavior is implemented in `highkey/admin/app/(dashboard)/products/[id]/page.tsx`.

Capabilities:

- Loads a single product via `productsApi.get(id)`.
- If the product is an `accessory`, loads customisation templates via `productsApi.getCustomisationTemplates(id)`.
- Shows product metadata, price, stock, customization flag, timestamps, ID, currency, and dimensions through `ProductDimensionsDisplay`.
- Supports editing through `ProductForm` and `productsApi.update()`.
- Supports activate/deactivate through `productsApi.activate()` and `productsApi.deactivate()`.
- Supports stock adjustment through `productsApi.adjustStock(id, delta)`.
- Supports image uploads through `productsApi.uploadImages()` using multiple `image/*` files.
- For accessory products, supports uploading one customization image when no template already exists. Accepted file types are PNG and WebP in the file input.
- Supports deleting customization templates through `productsApi.deleteCustomisationTemplate()` with a browser confirmation.

`ProductForm` in `highkey/admin/components/products/product-form.tsx` builds create/update payloads with name, optional description, product type, customizable flag, base price in cents, stock, currency, and optional dimensions. Dimension form helpers live in `highkey/admin/components/products/product-dimensions-fields.tsx`.

## 12. Orders module

The order list at `highkey/admin/app/(dashboard)/orders/page.tsx` fetches `ordersApi.list()` and supports filters for:

- Customer email
- Order status: `received`, `preparing`, `shipped_out`, `delivered`, `collection_scheduled`, `collected`, `cancelled`
- Payment status: `pending`, `paid`, `failed`, `refunded`, `disputed`

The table shows order number, customer name/email/phone, fulfillment method, total, order status badge, payment status badge, paid date, and created date. Row clicks route to `/orders/<id>`.

The order detail page at `highkey/admin/app/(dashboard)/orders/[id]/page.tsx` is the richest screen in the app. It loads an order through `ordersApi.get(id)` and renders operational action buttons, customer data, order summary, dispute details, collection location details, promotion details, line items, nested payment details, nested refunds, nested disputes, and JSON payload viewers.

Status workflow:

- `received` can advance to `preparing`.
- `preparing` can advance to `shipped_out` or `collection_scheduled`.
- `shipped_out` can advance to `delivered`.
- `collection_scheduled` can advance to `collected`.

Operational actions:

- Update status through `ordersApi.updateStatus(id, targetStatus)` after confirmation.
- Cancel non-cancelled orders through `ordersApi.cancel(id)` after confirmation.
- Generate a payment link for pending payments through `ordersApi.paymentLink(id)`.
- Create full or partial refunds through `ordersApi.refund(id, payload)` when the viewer is a super admin and the order payment status is `paid`.

Customization viewer:

- If `order.customizationMeta.is_customised` exists, a `View Customization Design` button opens a full-screen SVG visualizer.
- The viewer reads up to 25 patch slots from metadata keys like `patch_<n>_id`, `patch_<n>_x`, `patch_<n>_y`, and `patch_<n>_rot`.
- Canvas dimensions default to `50 x 50 mm` unless `canvas_width_mm` and `canvas_height_mm` are present.
- Patch dimensions come from matched product dimensions, falling back to `10 mm` values.
- For accessory products with `customisationImageIds`, the page fetches customisation templates through `productsApi.getCustomisationTemplates()` to resolve image URLs.

## 13. Collection locations module

Collection locations are managed in `highkey/admin/app/(dashboard)/locations/page.tsx`.

Capabilities:

- Lists locations through `locationsApi.list()`.
- Displays name, address, postal code, active status, and an activate/deactivate action.
- Expands rows to show ID, instructions, created date, and updated date.
- Creates new locations in a modal with name, address, optional postal code, and optional instructions through `locationsApi.create()`.
- Toggles active state through `locationsApi.activate()` and `locationsApi.deactivate()`.

The location data shape is defined in `highkey/admin/lib/types/location.ts` as `CollectionLocation`, `CreateLocationPayload`, and `UpdateLocationPayload`.

## 14. Promotions module

Promotions are managed in `highkey/admin/app/(dashboard)/promotions/page.tsx`.

Capabilities:

- Lists promotions through `promotionsApi.list()`.
- Displays scope, discount, active period, usage limit, active status, and activate/deactivate action.
- Expands rows to show ID, product ID, track-by-phone flag, created date, and updated date.
- Creates promotions in a modal through `promotionsApi.create()`.

Creation form behavior:

- Scope can be store-wide or product-only.
- Product-only promotions require a Product ID.
- Discount type can be percentage or fixed value.
- Fixed values are converted to cents using `Math.round(value * 100)`.
- Start and end values come from `datetime-local` fields and are converted with `new Date(...).toISOString()`.
- Optional usage limit is parsed as an integer or sent as `null`.
- Track-by-phone and active-immediately flags are included in the payload.

Promotion types and payloads are defined in `highkey/admin/lib/types/promotion.ts`.

## 15. Roadshow mode

Roadshow mode is implemented in `highkey/admin/app/(dashboard)/roadshow/page.tsx` and has two tabs: `New Sale` and `Order History`.

New Sale behavior:

- Collects a sale price in SGD, required location, and optional description.
- Converts the entered dollar amount to cents using `Math.round(parseFloat(price) * 100)`.
- Requires price greater than zero and a non-empty location before enabling submission.
- Calls `roadshowApi.create()` from `highkey/admin/lib/api/orders.ts`, which posts to `/api/v1/admin/orders/roadshow/create`.
- On success, displays a Stripe checkout QR code, checkout URL, session ID, copy-to-clipboard action, open-in-new-tab action, and reset action.

Order History behavior:

- Calls `ordersApi.list({ roadshow: true })`.
- Displays roadshow orders with order number, customer, total, payment badge, and created date.
- Row clicks route to `/orders/<id>`.

The `OrderListParams` type in `highkey/admin/lib/api/orders.ts` documents `roadshow?: boolean` as returning orders where `customizationMeta.isRoadshow === true`.

## 16. Finance module

Finance routes are under `highkey/admin/app/(dashboard)/finance/*` and backed by `highkey/admin/lib/api/finance.ts` plus finance/order types in `highkey/admin/lib/types/finance.ts` and `highkey/admin/lib/types/order.ts`.

Payments (`/finance/payments`):

- Implemented by `highkey/admin/app/(dashboard)/finance/payments/page.tsx`.
- Uses `financeApi.payments()` with `FinanceTablePage`.
- Shows order number, customer, amount, payment status badge, Stripe mode badge, and paid date.
- Expanded rows show provider, received/refunded amounts, Stripe checkout session, payment intent, charge, customer ID, lifecycle timestamps, and raw last payload.

Refunds (`/finance/refunds`):

- Implemented by `highkey/admin/app/(dashboard)/finance/refunds/page.tsx`.
- Uses `financeApi.refunds()` with `FinanceTablePage`.
- Shows order number, customer, amount, status, and refunded date.
- Expanded rows show payment/order IDs, Stripe refund ID, currency, reason, failure reason, timestamps, and raw payload.

Disputes (`/finance/disputes`):

- Implemented by `highkey/admin/app/(dashboard)/finance/disputes/page.tsx`.
- Uses `financeApi.disputes()` with `FinanceTablePage`.
- Shows order number, customer, amount, status, reason, and due date.
- Expanded rows show payment/order IDs, Stripe dispute ID, currency, evidence/won/lost timestamps, created/updated timestamps, and raw payload.

Stripe events (`/finance/stripe-events`):

- Implemented by `highkey/admin/app/(dashboard)/finance/stripe-events/page.tsx`.
- Uses `financeApi.stripeEvents()` and `usePaginatedFetch()` directly rather than `FinanceTablePage` because it has custom action behavior.
- Shows event type, processing status, mode, received date, and actions.
- Rows expand to show Stripe event ID, API version, object type/id, related order/payment/refund/dispute IDs, signature verification, Stripe created date, processed date, error message, created date, and payload.
- Super admins can reprocess failed events through `financeApi.reprocessStripeEvent(id)`.

Audit logs (`/finance/audit-logs`):

- Implemented by `highkey/admin/app/(dashboard)/finance/audit-logs/page.tsx`.
- Uses `financeApi.auditLogs()` with `FinanceTablePage`.
- Shows occurred date, actor type, action, summary, and success badge.
- Expanded rows show account ID, Stripe event record ID, source, entity type/id, order ID, request ID, correlation ID, IP address, user agent, created date, before data, after data, and metadata.

## 17. Completeness audit and notable observations

Completeness audit:

- App files discovered under `highkey/admin/app/**`: 18.
- App files read: 18 of 18.
- App TypeScript/TSX files read: 16 of 16.
- App CSS files read: 1 of 1.
- App binary assets read: 1 of 1 (`highkey/admin/app/favicon.ico`).
- App pages documented: 13 route pages.
- App layouts documented: 2 layouts.
- Direct supporting source files read under `components`, `contexts`, `hooks`, and `lib`: 37.
- App-level config files read: 5.
- Existing `highkey/admin/README.md`: read for awareness and not overwritten.
- Generated output file: `highkey/admin/README.generated.md`.

Notable implementation observations:

- Most interactive pages are client components; `"use client"` appears across dashboard pages because they rely on hooks, browser APIs, modals, clipboard, confirmation dialogs, and client-side routing.
- Auth protection is client-side. Backend endpoints still need to enforce authorization because UI gating alone is not security.
- All API calls include cookies via `credentials: "include"`.
- The login redirect stores a `from` query in the dashboard guard, but the login success handler always routes to `/`.
- Several destructive or financial actions use browser confirmations or modal confirmation but depend on backend enforcement for permissions and consistency.
- `apiRequest()` rewrites image origins in JSON responses for image fields, which affects how product and customization images render in the browser.
- `ProductForm` always sends currency as existing currency or `SGD`; there is no visible currency selector.
- Promotion creation requires dates, but validation is mostly form-level and backend-dependent beyond the explicit discount/product checks.
- The order customization viewer is tightly coupled to `customizationMeta` key naming and product dimensions.
- The admin app has no documented server actions or Route Handlers in `app/**`; behavior is frontend-to-backend API driven.
