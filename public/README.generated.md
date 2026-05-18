# Highkey Public Storefront — Generated README

This document describes the independent Next.js app in `highkey/public`. It was generated from a recursive read of every file under `highkey/public/app/**`, plus the direct supporting imports needed to explain runtime behavior. It intentionally does **not** replace `highkey/public/README.md`.

## 1. Scope, audience, and evidence model

- **Scope:** the public customer-facing storefront under `highkey/public`, with the App Router entrypoint in `highkey/public/app`.
- **Audience:** developers maintaining the public storefront, backend/API integrators, and product/operations stakeholders who need to understand customer flows.
- **Evidence style:** behavior is tied to source paths and line ranges instead of large code excerpts. Key route and helper references use paths such as `highkey/public/app/shop/page.tsx#L1-L152`.
- **Files read for primary scope:** every file under `highkey/public/app/**`, including route files, UI helpers colocated under `app`, JSON API references, temporary data JSON, CSS, and the favicon.
- **Supporting imports read:** direct imported modules needed to explain behavior, including `highkey/public/lib/api/storefront.ts`, `highkey/public/lib/api/client.ts`, `highkey/public/lib/types/storefront.ts`, `highkey/public/app/utils/cartEngine.ts`, `highkey/public/store/useBuilderStore.ts`, `highkey/public/lib/builderSession.ts`, `highkey/public/hooks/useCartCount.ts`, `highkey/public/lib/order/display.ts`, layout components, button utilities, and app-level config files.

## 2. Independent app boundary and ownership

`highkey/public` is its own Next.js application and should be treated as independent from sibling apps such as `highkey/admin`.

Evidence:

- `highkey/public/package.json#L1-L28` declares an app named `highkey`, marks it private, and owns its own `dev`, `build`, `start`, and `lint` scripts.
- `highkey/public/tsconfig.json#L1-L31` defines the `@/*` path alias as local to `highkey/public` via `"@/*": ["./*"]`. Therefore imports like `@/lib/api/storefront` resolve inside `highkey/public`, not the repository root or admin app.
- `highkey/public/next.config.ts#L1-L18` configures this app’s Next image behavior independently, including `images.unoptimized: true` and broad HTTP/HTTPS remote image patterns.
- `highkey/public/app/layout.tsx#L1-L39` owns the public app shell, metadata, global CSS import, navigation, main content region, and footer.
- Generated documentation lives at `highkey/public/README.generated.md` and intentionally preserves `highkey/public/README.md` as the default scaffold README.

Operationally, work on this app should be run from `highkey/public` with the scripts in `package.json`; do not assume admin dependencies, admin API clients, or admin components are available unless explicitly imported through this public app’s alias.

## 3. Runtime, framework, dependencies, and configuration

The public storefront is a client-heavy Next.js App Router project.

- **Framework:** `next` `^16.2.6`, React `^19.2.6`, React DOM `^19.2.6` from `highkey/public/package.json#L10-L26`.
- **Styling:** Tailwind CSS v4 is imported with `@import "tailwindcss"` in `highkey/public/app/globals.css#L1-L68`, plus `tailwindcss-animate`.
- **Animation:** `framer-motion` is used extensively across landing, shop, product view, builder, cart, checkout, order, and loading states.
- **Icons:** `lucide-react` provides UI icons across most pages.
- **State:** `zustand` is used only for the legacy/custom builder state in `highkey/public/store/useBuilderStore.ts#L1-L156`; cart state is IndexedDB-backed through `highkey/public/app/utils/cartEngine.ts#L1-L344`.
- **UI composition:** `@radix-ui/react-slot`, `class-variance-authority`, `clsx`, and `tailwind-merge` support the shared `Button` and class merging utilities in `highkey/public/components/ui/button.tsx#L1-L54` and `highkey/public/lib/utils.ts#L1-L5`.
- **API base URL:** `NEXT_PUBLIC_API_URL` is required by `highkey/public/lib/api/client.ts#L3-L10`. If missing, `apiFetch` throws before network requests are made.
- **Images:** Next image optimization is disabled in both config and per-component usage. `next.config.ts#L3-L16` sets `unoptimized: true`, and product images generally pass `unoptimized` in components such as `highkey/public/app/shop/productDisplay.tsx#L132-L145` and `highkey/public/app/view/page.tsx#L176-L186`.

## 4. App shell, metadata, navigation, and layout

The root layout establishes the visual and structural wrapper for all public routes.

- `highkey/public/app/layout.tsx#L1-L15` imports the Inter font through `next/font/google`, assigns `--font-inter`, and exports metadata with title `Highkey | Upcycled Denim Keychains`, a customer-facing description, and `/logo.svg` as the icon.
- `highkey/public/app/layout.tsx#L17-L39` renders `Navbar`, a flexing `<main>`, and `Footer` around every route.
- `highkey/public/components/layout/Navbar.tsx#L1-L68` is a fixed header that:
  - Links the logo to `/`.
  - Shows desktop nav links for `/shop`, `/about`, and `/#how-it-works`.
  - Shows a cart icon linked to `/cart`.
  - Uses `useCartCount` to display a live cart badge and caps the badge label at `99+`.
  - Changes visual treatment after scrolling more than 20px.
- `highkey/public/components/layout/Footer.tsx#L1-L44` provides brand copy and footer navigation to `/shop`, `/#how-it-works`, `/about`, and `/order`.
- `highkey/public/components/Logo.tsx#L1-L30` renders the Highkey SVG logo as `fill-current`, allowing the navbar/footer to color it with Tailwind text color classes.

The layout body uses `pt-20` in `highkey/public/app/layout.tsx#L34-L36` so fixed navigation does not overlay route content by default.

## 5. Route inventory and customer-facing pages

The public app routes under `highkey/public/app` are:

- `/` from `highkey/public/app/page.tsx#L1-L180`: animated landing page with hero, marquee, product showcase, process cards, and material philosophy.
- `/about` from `highkey/public/app/about/page.tsx#L1-L73`: brand story, values grid, and manifesto quote.
- `/shop` from `highkey/public/app/shop/page.tsx#L1-L152`: product listing with `All`, `Base`, and `Accessory` filters and pagination.
- `/view?product_id=...` from `highkey/public/app/view/page.tsx#L1-L664`: product detail page with image gallery, stock status, share, add-to-bag, and customize CTA for base products.
- `/build?product_id=...` from `highkey/public/app/build/page.tsx#L1-L740`: older desktop-only drag/drop builder using a synthetic denim grid and Zustand builder store.
- `/customize?product_id=...` and `/customize?product_id=...&cart_item_id=...` from `highkey/public/app/customize/page.tsx#L1-L917`: newer customization studio that places real accessory/template images on an SVG millimeter canvas and can add or update customized cart items.
- `/cart` from `highkey/public/app/cart/page.tsx#L1-L467`: IndexedDB-backed cart view with grouped customized base/patch line items, quantity controls, removal, edit links, promotions modal, and checkout navigation.
- `/checkout` from `highkey/public/app/checkout/page.tsx#L1-L499`: contact, fulfillment, quote, promotions, and Stripe checkout session flow.
- `/order` and `/order?token=...` from `highkey/public/app/order/page.tsx#L1-L201`: order lookup form and order details after token fetch.
- `/order-cancelled` from `highkey/public/app/order-cancelled/page.tsx#L1-L46`: cancellation landing page with return-to-cart and continue-shopping actions.

Colocated route helpers include:

- `highkey/public/app/shop/productDisplay.tsx#L1-L297`: product cards and grid rendering.
- `highkey/public/app/shop/productsLoading.tsx#L1-L65`: shimmer loading skeleton.
- `highkey/public/app/shop/productsLoadError.tsx#L1-L26`: load failure UI with reload action.
- `highkey/public/app/order/orderDetails.tsx#L1-L527`: order confirmation, status timeline, fulfillment/contact cards, line items, promotion/dispute displays, and payment summary.
- `highkey/public/app/utils/cartEngine.ts#L1-L344`: browser cart persistence service.

## 6. Design system, styling, and UI conventions

Global styling is centralized in `highkey/public/app/globals.css#L1-L68`.

- Theme tokens define a white/off-white editorial palette, red primary `#e8132a`, black foreground `#0d0d0d`, muted tan/gray text, border colors, radius values, and multi-layer shadow tokens.
- `--font-sans` is bound to the Inter variable from layout; headings use Helvetica/Arial fallback through `--font-heading`.
- The app applies a global body background, text color, font family, optimized text rendering, and antialiasing.
- `accent-underline` is a custom utility for red underline transitions.

The shared `Button` in `highkey/public/components/ui/button.tsx#L1-L54` supports variants `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`, and `ghost-outline`, plus sizes `default`, `sm`, `lg`, and `icon`. It uses `cn` from `highkey/public/lib/utils.ts#L1-L5` to merge CVA output with caller-provided Tailwind classes.

Visual conventions repeated across the app:

- Red primary CTAs and status accents.
- Rounded cards and pill controls.
- Framer Motion entrance/hover transitions.
- Product imagery rendered as `object-contain` with an unoptimized Next image path.
- Loading indicators as red bordered spinning circles.
- Desktop/mobile-specific layouts where customization requires larger screens.

## 7. Data contracts and API documentation files

The app contains JSON API reference documents under `highkey/public/app/api`, plus a public storefront contract at `highkey/public/public-storefront.json`.

Public storefront endpoints used by the app are documented in `highkey/public/public-storefront.json#L1-L281` and implemented by `highkey/public/lib/api/storefront.ts#L1-L75`:

- `GET /api/v1/products` for product listing with optional `type` filter.
- `GET /api/v1/products/:id` for product detail.
- `GET /api/v1/products/:id/customisation-templates` for customization template images.
- `GET /api/v1/collection-locations` for active pickup locations.
- `GET /api/v1/promotions` through `listPromotions`, based on typed support in `highkey/public/lib/types/storefront.ts#L43-L60`.
- `POST /api/v1/checkout/quote` for totals and validation.
- `POST /api/v1/checkout/session` for Stripe checkout session creation.
- `GET /api/v1/orders/:publicToken` for customer order lookup.

Admin/backend reference JSON files under `app/api` are not imported by customer pages, but document related backend capabilities:

- `highkey/public/app/api/admin-auth.json#L1-L54`: login/logout/me cookie-session endpoints.
- `highkey/public/app/api/admin-products.json#L1-L303`: product CRUD, stock, product images, and customization template endpoints.
- `highkey/public/app/api/admin-orders.json#L1-L342`: order list/detail/status/cancel/refund/payment-link/audit/roadshow endpoints.
- `highkey/public/app/api/admin-promotions.json#L1-L167`: promotion CRUD and activation/deactivation.
- `highkey/public/app/api/admin-locations.json#L1-L129`: collection location CRUD and active state.
- `highkey/public/app/api/admin-finance.json#L1-L239`: payments, refunds, disputes, Stripe events, audit logs, and webhook reprocessing.
- `highkey/public/app/api/webhooks.json#L1-L17`: Stripe webhook receiver contract.

The TypeScript product, checkout, promotion, collection location, order, and API error shapes are in `highkey/public/lib/types/storefront.ts#L1-L220`.

## 8. Storefront API client and image URL handling

All public API calls go through `highkey/public/lib/api/storefront.ts#L1-L75`, which delegates to `apiFetch` from `highkey/public/lib/api/client.ts#L1-L73`.

Important behavior:

- `baseUrl()` reads `process.env.NEXT_PUBLIC_API_URL`, strips a trailing slash, and throws if it is not configured (`highkey/public/lib/api/client.ts#L3-L10`).
- `apiFetch` always sends `Content-Type: application/json`, merges any caller headers, parses JSON if possible, and throws `StorefrontApiError` for non-OK responses (`highkey/public/lib/api/client.ts#L52-L73`).
- `replaceImageOrigins` recursively rewrites `imageIds`, `customisationImageIds`, and upload-style `url` fields to `window.origin` on the browser (`highkey/public/lib/api/client.ts#L17-L49`). This means backend-returned absolute upload URLs are normalized to same-origin paths in the storefront at runtime.
- The client exposes typed helpers for products, customization templates, collection locations, promotions, checkout quote/session, and order lookup (`highkey/public/lib/api/storefront.ts#L12-L75`).

Money and dimensions are formatted by `highkey/public/lib/format.ts#L1-L15`:

- `formatMoney(cents, currencyCode = "SGD")` uses `Intl.NumberFormat("en-SG")`, falling back to `CURRENCY amount` if Intl formatting fails.
- `mmToCm(mm)` rounds millimeters to one decimal centimeter value.

## 9. Landing, about, and brand storytelling

The landing page in `highkey/public/app/page.tsx#L1-L180` is a fully client-rendered brand entry point.

Key content and behavior:

- Hero message: `UPCYCLED DENIM · MADE FOR YOU`, headline `Your keys deserve a second life.`, and subcopy `Handcut denim keychains. Yours to customize.` (`page.tsx#L18-L65`).
- Primary CTA goes to `/shop`; secondary CTA scrolls to `#how-it-works` (`page.tsx#L66-L79`).
- A looping marquee repeats `DENIM REBORN · PATCH IT UP · CARRY YOUR STORY · HIGHKEY ·` (`page.tsx#L88-L101`).
- Product showcase uses `/example_denim.jpeg` and denim color buttons as a conceptual canvas preview (`page.tsx#L104-L139`).
- Process cards explain `Pick your base`, `Add your patches`, and `Carry it` (`page.tsx#L142-L157`), animated by the local `StepCard` component (`page.tsx#L181-L205` in logical file end; line count is 180 due file display, implementation begins near bottom).
- Material philosophy section describes reclaimed jeans and shows three denim imagery treatments (`page.tsx#L159-L178`).

The about page in `highkey/public/app/about/page.tsx#L1-L73` reinforces the brand:

- Hero: `Jeans that lived a life. Keychains that carry one.`
- Values: `Upcycled`, `Handcrafted`, and `Yours`.
- Manifesto quote: `Highkey isn't about making new things. It's about seeing the life still left in old ones.`

## 10. Shop listing and product card behavior

`highkey/public/app/shop/page.tsx#L1-L152` implements the catalog route.

Behavior:

- Maintains `filter`, `products`, `pagination`, `page`, loading, and error state.
- Supports filters `All`, `Base`, and `Accessory` (`shop/page.tsx#L11-L12`).
- Resets page to 1 when the filter changes (`shop/page.tsx#L25-L27`).
- Calls `listProducts({ page, limit: 20, type })`, where `type` is `base`, `accessory`, or omitted (`shop/page.tsx#L29-L51`).
- Shows sticky filter tabs under the page hero (`shop/page.tsx#L63-L93`).
- Uses `ProductsLoading` while fetching, `ProductDisplay` for results, and pagination controls when multiple pages exist (`shop/page.tsx#L95-L151`).

`highkey/public/app/shop/productDisplay.tsx#L1-L297` contains the card grid:

- `ProductCard` renders a tilt/hover animated product card using `useMotionValue`, `useSpring`, and `useTransform` (`productDisplay.tsx#L18-L50`).
- A base product that is customizable is considered buildable by `item.productType === "base" && item.isCustomizable` (`productDisplay.tsx#L35-L36`).
- Clicking the card navigates to `/view?product_id=...`; clicking the action button goes to `/build?product_id=...` for buildable products or `/view?product_id=...` otherwise (`productDisplay.tsx#L40-L49`). This is notable because the product detail page’s customization CTA uses `/customize`, so both builder paths currently coexist.
- Low stock and sold out pills are based on `availableStock` (`productDisplay.tsx#L37-L39`, `productDisplay.tsx#L177-L192`).
- The first card is featured when there are more than two products (`productDisplay.tsx#L288-L294`).

Loading and error support:

- `highkey/public/app/shop/productsLoading.tsx#L1-L65` renders animated shimmer cards.
- `highkey/public/app/shop/productsLoadError.tsx#L1-L26` shows a failure state and a `Refresh Page` button that calls `window.location.reload()`.

## 11. Product detail and purchase actions

`highkey/public/app/view/page.tsx#L1-L664` implements the product detail route.

Data flow:

- Reads `product_id` from `useSearchParams` (`view/page.tsx#L293-L294`).
- If absent, shows `No product ID provided.` (`view/page.tsx#L297-L303`).
- Fetches the product with `getProduct(productId)` and handles `StorefrontApiError` messages (`view/page.tsx#L305-L316`).

Image gallery behavior:

- `ImageGallery` supports multiple images, keyboard arrow navigation, thumbnails, animated transitions, hover-to-zoom, and mobile horizontal thumbnails (`view/page.tsx#L37-L281`).
- If no images exist, it shows a `No preview` placeholder (`view/page.tsx#L189-L198`).

Purchase behavior:

- `isBuildable` is currently `product.productType === "base"` (`view/page.tsx#L386-L386`), not additionally gated by `isCustomizable`.
- `handleAddToCart` prevents adding out-of-stock products, then calls `cartEngine.addItem(product.id, 1)`, emits a cart update with `notifyCartUpdated()`, and shows a transient `Added to bag` state (`view/page.tsx#L331-L344`).
- Buildable products show both `Add to bag` and `Customize`; customize links to `/customize?product_id=...` (`view/page.tsx#L432-L482`).
- The share button copies `window.location.href` to the clipboard and shows `Copied` feedback (`view/page.tsx#L321-L329`, `view/page.tsx#L461-L480`).
- Detail cards summarize material, stock availability, active listing status, and type (`view/page.tsx#L571-L593`).

## 12. Customization and builder flows

There are two customization-related routes.

### Current customization studio: `/customize`

`highkey/public/app/customize/page.tsx#L1-L917` is the newer, image-based customization studio.

Core model:

- `PlacedPatch` stores a unique instance id, product object, center coordinates in millimeters, dimensions in millimeters, and optional rotation (`customize/page.tsx#L28-L36`).
- `getPatchDims` derives patch size from product dimensions, falling back to 10mm by 10mm (`customize/page.tsx#L40-L45`).
- `isValidPlacement` keeps patch centers within bounds and rejects overlapping axis-aligned patch boxes (`customize/page.tsx#L47-L83`).

Canvas behavior:

- `ProductCanvas` renders an SVG canvas whose viewBox is product dimensions plus padding (`customize/page.tsx#L87-L128`).
- Dropping a patch parses drag data, enforces the maximum patch count, converts screen coordinates to SVG coordinates, clamps to canvas bounds, and rejects overlaps (`customize/page.tsx#L129-L177`).
- Existing patches can be dragged with pointer events and collision checks (`customize/page.tsx#L180-L235`).
- Patches render with customization template image if available, otherwise the product image, otherwise a placeholder rectangle (`customize/page.tsx#L313-L379`).
- Users can delete a patch through an SVG delete circle (`customize/page.tsx#L382-L400`).
- Zoom controls allow 10% to 1000% typed values internally clamped to 0.1 to 10, with plus/minus buttons constrained between 0.25 and 3 in button increments (`customize/page.tsx#L406-L439`).
- Selecting a patch reveals a rotation slider from 0 to 360 degrees (`customize/page.tsx#L441-L466`).

Data loading and editing:

- The page reads `product_id` and optional `cart_item_id` (`customize/page.tsx#L470-L475`).
- It fetches the base product, active accessories, and existing cart items if editing (`customize/page.tsx#L502-L509`).
- For accessories with `customisationImageIds`, it fetches template images via `getCustomisationTemplates` and maps the selected template id to a URL (`customize/page.tsx#L516-L536`).
- When editing an existing customized cart item, it reconstructs patches from `customizationMeta` keys like `patch_0_id`, `patch_0_x`, `patch_0_y`, and `patch_0_rot` (`customize/page.tsx#L539-L573`).

Saving:

- `handleSave` builds `customizationMeta` with canvas size, `is_customised`, patch ids, rounded x/y coordinates, rotation, and layer index for patches after the first (`customize/page.tsx#L598-L623`).
- New designs call `cartEngine.addCustomizedProduct`; edits call `cartEngine.updateCustomizedProduct` (`customize/page.tsx#L625-L633`).
- On success, the user is routed to `/cart` after a short delay (`customize/page.tsx#L634-L636`).
- Mobile users see a desktop-recommended fallback instead of the full studio (`customize/page.tsx#L662-L682`).

### Legacy builder: `/build`

`highkey/public/app/build/page.tsx#L1-L740` is an older desktop-only builder using a CSS/HTML denim grid.

- It uses `useBuilderStore` from `highkey/public/store/useBuilderStore.ts#L1-L156` for active base, placed patches, history, undo/redo, reset, and patch positioning.
- It fetches a base product and accessories, requires the base to be `productType === "base"` and `isCustomizable`, and filters accessories by active/in-stock (`build/page.tsx#L197-L223`).
- Patch dimensions are converted from millimeters to centimeters (`build/page.tsx#L69-L78`).
- Drops are clamped to the grid and rejected on overlap (`build/page.tsx#L302-L354`).
- Pricing includes the base plus paid patches after the first `maxPatches` patches (`build/page.tsx#L280-L290`).
- `handleAddToCart` adds only the base product to cart, saves a builder session in localStorage, emits a cart update, and routes to `/cart` (`build/page.tsx#L356-L371`). Because patch payloads are not added here, this route appears less complete than `/customize` for persisted customized purchases.

Builder session helpers in `highkey/public/lib/builderSession.ts#L1-L57` save, load, clear, and convert legacy builder sessions into `customizationMeta`, but the current cart page does not read `loadBuilderSession`.

## 13. Cart persistence and cart page behavior

Cart persistence is handled by `highkey/public/app/utils/cartEngine.ts#L1-L344` using browser IndexedDB.

Storage details:

- Database name: `HighKeyCartDB`.
- Version: `2`.
- Object store: `cart_items_v2`.
- Key path: `cart_item_id`.
- On upgrade from versions below 2, old `cart_items` is deleted if present (`cartEngine.ts#L3-L50`).

Cart item shape:

- `cart_item_id`, `product_id`, and `quantity` are required.
- Optional fields support `customizationMeta`, `standalone`, and `referenceId` (`cartEngine.ts#L1-L8`).

Important engine behavior:

- `addItem` increments an existing matching standalone, non-custom, no-reference item; otherwise creates a new UUID cart item (`cartEngine.ts#L56-L109`).
- `addCustomizedProduct` first removes any existing customized item, then transactionally adds one base parent with customization metadata and child patch items referencing the base cart id (`cartEngine.ts#L112-L159`). This enforces at most one customized design in the cart.
- `updateCustomizedProduct` deletes and recreates a customized parent with the same cart id and new child patch rows (`cartEngine.ts#L162-L207`).
- `removeItem` deletes a parent and any children whose `referenceId` matches it (`cartEngine.ts#L213-L252`).
- `updateItemQuantity` updates the item and scales child patch quantities for customized parents (`cartEngine.ts#L259-L306`).
- All successful mutations dispatch `highkey:cart-updated` events.

The cart page in `highkey/public/app/cart/page.tsx#L1-L467`:

- Loads all cart items, fetches each unique product with `getProduct`, and builds a product map (`cart/page.tsx#L23-L52`).
- Listens for `highkey:cart-updated` events (`cart/page.tsx#L54-L58`).
- Loads promotions once (`cart/page.tsx#L60-L63`).
- Groups top-level items by `standalone !== false`, then renders customized patch children underneath their base item (`cart/page.tsx#L117-L117`, `cart/page.tsx#L155-L156`, `cart/page.tsx#L251-L285`).
- Allows quantity increments/decrements and removal (`cart/page.tsx#L85-L104`).
- Links customized bases to `/customize?product_id=...&cart_item_id=...` for editing (`cart/page.tsx#L223-L229`).
- Shows a promotions modal and disables promotions outside date range or scoped to products not in cart (`cart/page.tsx#L66-L83`, `cart/page.tsx#L378-L456`).
- Navigates to `/checkout` from the summary (`cart/page.tsx#L349-L352`).

The cart badge hook in `highkey/public/hooks/useCartCount.ts#L1-L30` reads `cartEngine.getTotalQuantity()` and listens for the same cart update event.

## 14. Checkout, promotions, fulfillment, and Stripe handoff

`highkey/public/app/checkout/page.tsx#L1-L499` implements the checkout route.

Initial load:

- Reads cart items from IndexedDB and marks the cart empty if none exist (`checkout/page.tsx#L102-L111`).
- Fetches collection locations with `listCollectionLocations()` (`checkout/page.tsx#L112-L114`).
- Fetches promotions with `listPromotions({ limit: 100 })` (`checkout/page.tsx#L116-L118`).

Quote flow:

- `fetchQuote` reads cart items, finds any customized base, extracts `customizationMeta`, and calls `getCheckoutQuote` (`checkout/page.tsx#L47-L100`).
- The quote payload includes customer fields, fulfillment details, all cart line items, selected promotion id, and customization metadata (`checkout/page.tsx#L60-L79`).
- Quote calculation is debounced by 400ms and only runs after name, email, and phone are present (`checkout/page.tsx#L140-L144`).
- API errors are shown using `StorefrontApiError.message` when available (`checkout/page.tsx#L80-L88`).

Fulfillment:

- Customer details include name, email, country code defaulting to `+65`, and phone (`checkout/page.tsx#L37-L40`, `checkout/page.tsx#L213-L250`).
- Fulfillment defaults to `self_collect` (`checkout/page.tsx#L42-L43`).
- Self collection requires selecting a collection location; delivery requires entering a delivery address (`checkout/page.tsx#L253-L302`).

Promotion behavior:

- The same date/product scope disable logic used in cart appears here (`checkout/page.tsx#L121-L138`).
- The promotions modal allows selecting, changing, or clearing a promotion (`checkout/page.tsx#L394-L474`).
- Quote summary shows applied discount if the backend quote applies one (`checkout/page.tsx#L321-L327`).

Stripe handoff:

- `handleSubmit` builds a `createCheckoutSession` request with cart items, customer, fulfillment, promotion, customization metadata, and optional note (`checkout/page.tsx#L147-L183`).
- On success, it redirects the browser to `session.checkoutUrl` (`checkout/page.tsx#L174-L175`).
- The button text becomes `Redirecting to payment...` while submitting (`checkout/page.tsx#L385-L390`).

The `/order-cancelled` route in `highkey/public/app/order-cancelled/page.tsx#L1-L46` handles a canceled payment by telling the user the order was not placed and linking back to `/cart` or `/shop`.

## 15. Order lookup, confirmation, and status display

Order lookup is split between `highkey/public/app/order/page.tsx#L1-L201` and `highkey/public/app/order/orderDetails.tsx#L1-L527`.

Lookup route behavior:

- Without `token`, `/order` renders a lookup form asking for the order reference token (`order/page.tsx#L14-L89`).
- Submitting the form navigates to `/order?token=...` using `window.location.href` (`order/page.tsx#L119-L123`).
- With `token`, the page calls `getOrder(token)` (`order/page.tsx#L96-L111`).
- After a successful order fetch, it clears the cart using `cartEngine.clearCart()` (`order/page.tsx#L101-L103`).
- Errors show an `Order not found` state with links to retry or shop (`order/page.tsx#L146-L165`).

Order details behavior:

- Status labels, tones, fulfillment labels, date formatting, and timeline steps are sourced from `highkey/public/lib/order/display.ts#L1-L127`.
- The hero shows order number, placed date, order status, payment status, and a fulfillment-specific timeline (`orderDetails.tsx#L251-L301`).
- `StatusTimeline` handles normal delivery/self-collect sequences and terminal states like cancelled/refunded/disputed (`orderDetails.tsx#L86-L155`).
- `OrderLineItem` attempts to refetch each product by `productId` for fresher images/descriptions, falling back to the product embedded on the order item (`orderDetails.tsx#L157-L232`).
- Fulfillment and contact cards render delivery address, collection location instructions, customer email, and phone (`orderDetails.tsx#L311-L377`).
- Optional note, promotion, and dispute sections render only when relevant (`orderDetails.tsx#L379-L426`).
- Payment summary includes subtotal, discount, tax, shipping, refunded amount, total, paid/updated timestamps, and a copyable public token (`orderDetails.tsx#L428-L523`).

## 16. Static data, assets, and non-route app files

Files under `highkey/public/app` that are not route page implementations still matter to documentation:

- `highkey/public/app/globals.css#L1-L68`: Tailwind v4 import, plugin registration, theme tokens, body and heading defaults, and custom `accent-underline` utility.
- `highkey/public/app/layout.tsx#L1-L39`: global shell and metadata.
- `highkey/public/app/favicon.ico`: binary favicon asset; it was included in the recursive read scope. The read tool identified it as image/binary content rather than source text.
- `highkey/public/app/Temporary-data/denims.json#L1-L46`: five denim color records with `key`, `name`, price `3.5`, currency `USD`, category `colors`, five free patches, and 12 by 5 box measures. Current route code does not import this JSON.
- `highkey/public/app/Temporary-data/patches.json#L1-L59`: static patch catalog with animals, characters, Marvel-style characters, and others, priced mostly `1.5` or `2.0` USD with 1 by 1 measures. Current route code does not import this JSON.
- The API JSON files under `highkey/public/app/api` are static reference documents and are not Next route handlers. They are JSON files in the `app` tree, not `route.ts` files.

External/static image references observed in route code:

- `/example_denim.jpeg` is used by the landing page product showcase and material philosophy sections (`highkey/public/app/page.tsx#L115-L174`).
- `/logo.svg` is configured as metadata icon (`highkey/public/app/layout.tsx#L12-L14`) and rendered by `Logo` components in navbar/footer via inline SVG component rather than the file path.

## 17. Completeness audit and maintenance notes

### Recursive `highkey/public/app/**` audit

Every file under `highkey/public/app/**` was read. Counts from the audit:

- **Total path matches under `app/**`:** 40, including directories and files.
- **Total files read under `app/**`:** 27.
- **Total lines across text-counted `app` files:** 6,691.
- **Extension counts:** 15 `.tsx`, 1 `.ts`, 9 `.json`, 1 `.css`, 1 `.ico`.

Files read under `highkey/public/app/**`:

| File | Lines | Role |
|---|---:|---|
| `highkey/public/app/about/page.tsx` | 73 | About route |
| `highkey/public/app/api/admin-auth.json` | 54 | Admin auth API reference |
| `highkey/public/app/api/admin-finance.json` | 239 | Admin finance API reference |
| `highkey/public/app/api/admin-locations.json` | 129 | Admin locations API reference |
| `highkey/public/app/api/admin-orders.json` | 342 | Admin orders API reference |
| `highkey/public/app/api/admin-products.json` | 303 | Admin products API reference |
| `highkey/public/app/api/admin-promotions.json` | 167 | Admin promotions API reference |
| `highkey/public/app/api/webhooks.json` | 17 | Stripe webhook API reference |
| `highkey/public/app/build/page.tsx` | 740 | Legacy builder route |
| `highkey/public/app/cart/page.tsx` | 467 | Cart route |
| `highkey/public/app/checkout/page.tsx` | 499 | Checkout route |
| `highkey/public/app/customize/page.tsx` | 917 | Current customization studio |
| `highkey/public/app/favicon.ico` | 30 counted by line tool | Favicon binary/image asset |
| `highkey/public/app/globals.css` | 68 | Global theme and CSS |
| `highkey/public/app/layout.tsx` | 39 | Root layout and metadata |
| `highkey/public/app/order/orderDetails.tsx` | 527 | Order details component |
| `highkey/public/app/order/page.tsx` | 201 | Order lookup route |
| `highkey/public/app/order-cancelled/page.tsx` | 46 | Payment cancelled route |
| `highkey/public/app/page.tsx` | 180 | Landing route |
| `highkey/public/app/shop/page.tsx` | 152 | Shop listing route |
| `highkey/public/app/shop/productDisplay.tsx` | 297 | Product grid/cards |
| `highkey/public/app/shop/productsLoadError.tsx` | 26 | Product loading error UI |
| `highkey/public/app/shop/productsLoading.tsx` | 65 | Product loading skeleton |
| `highkey/public/app/Temporary-data/denims.json` | 46 | Static denim sample data |
| `highkey/public/app/Temporary-data/patches.json` | 59 | Static patch sample data |
| `highkey/public/app/utils/cartEngine.ts` | 344 | IndexedDB cart engine |
| `highkey/public/app/view/page.tsx` | 664 | Product detail route |

### Direct supporting imports and config read

Supporting files read because they are direct imports or required to explain independent app behavior:

- `highkey/public/components/ui/button.tsx`
- `highkey/public/components/layout/Navbar.tsx`
- `highkey/public/components/layout/Footer.tsx`
- `highkey/public/components/Logo.tsx`
- `highkey/public/hooks/useCartCount.ts`
- `highkey/public/lib/api/client.ts`
- `highkey/public/lib/api/storefront.ts`
- `highkey/public/lib/types/storefront.ts`
- `highkey/public/lib/format.ts`
- `highkey/public/lib/builderSession.ts`
- `highkey/public/lib/order/display.ts`
- `highkey/public/lib/utils.ts`
- `highkey/public/store/useBuilderStore.ts`
- `highkey/public/package.json`
- `highkey/public/next.config.ts`
- `highkey/public/tsconfig.json`
- `highkey/public/public-storefront.json`

### Maintenance notes and observed risks

- **Two customization paths coexist:** shop product cards route buildable products to `/build`, while product detail routes base products to `/customize`. `/customize` persists parent and child patch items; `/build` adds only the base and saves a builder session to localStorage. If `/build` is deprecated, update `highkey/public/app/shop/productDisplay.tsx#L43-L49` to point to `/customize` or remove the route.
- **`/view` treats every base product as buildable:** `highkey/public/app/view/page.tsx#L386` checks only `product.productType === "base"`; `/build` checks both base type and `isCustomizable`. If non-customizable base products exist, align this logic.
- **Only one customized design is allowed:** `cartEngine.addCustomizedProduct` removes any existing customized item before adding a new one (`highkey/public/app/utils/cartEngine.ts#L118-L123`). This is intentional if the product model allows only one custom design, but should be revisited if users need multiple custom keychains.
- **Promotion selection in cart is local to cart:** the cart page can select a promotion, but checkout has its own `selectedPromotionId` state and does not receive the cart page selection through URL or storage. Users may need to select the promotion again in checkout.
- **API URL is mandatory:** missing `NEXT_PUBLIC_API_URL` will break all storefront API calls at runtime (`highkey/public/lib/api/client.ts#L3-L10`).
- **Image URL rewriting is browser-only:** server-side calls would not rewrite image origins because `replaceImageOrigins` returns early when `window` is undefined (`highkey/public/lib/api/client.ts#L17-L19`). Most consumers are client components, so this fits current usage.
- **Temporary JSON is unused by current code:** `Temporary-data` appears to be historical/mock data. Current product and accessory data is fetched from backend APIs.
