# AGENTS.md

This file provides guidance to Qoder (qoder.com) when working with code in this repository.

## Commands

```bash
# Install dependencies
npm install

# Start dev server (Vite, default port 5173, proxies /admin to backend)
npm run dev

# Production build
npm run build

# Lint check / auto-fix
npm run lint
npm run fix

# Format all files with Prettier
npm run format

# Lint + Stylelint fix
npm run lint:eslint
npm run lint:style
```

No test framework is configured in this project.

## Architecture

**Vue 3 + TypeScript + Vite 4 + Element Plus + Pinia** — a rental housing admin panel.

### Request Layer (`src/utils/http/index.ts`)

Axios is wrapped with generic typed methods (`http.get<T>()`, `http.post<T>()`, etc.) returning `Promise<ResultData<T>>`. Key behaviors:
- Dev: `baseURL` is `/`, Vite proxies `/admin` prefix to `VITE_APP_BASE_URL` (defined in `.env.development`).
- Prod: `baseURL` is the absolute `VITE_APP_BASE_URL` from `.env.production`.
- Request interceptor injects `access-token` header from Pinia user store.
- Response interceptor handles token expiry (redirect to login) and shows `ElMessage.error` for business errors.

### API Module Convention (`src/api/`)

Each business module has its own directory with `index.ts` (request functions) and `types.ts` (interfaces). Example: `src/api/rentManagement/index.ts` + `types.ts`.

### Routing (`src/router/`)

- Hash mode router, all routes statically defined in `constantRoutes.ts`.
- Route guard in `index.ts`: login page control → whitelist bypass → token check → redirect to login with `redirect` query param if unauthenticated.
- Route `meta` fields: `isHide` (hide from sidebar), `activeMenu` (highlight parent on detail pages), `isFull`, `isAffix`, `isKeepAlive`.

### State Management (`src/store/`)

Pinia with `pinia-plugin-persistedstate`. Key stores:
- `user.ts` — token, user info (persisted)
- `settings.ts` — theme/layout settings
- `tabsBar.ts` — tab navigation state

### Global Components (`src/components/`)

Registered globally in `main.ts` via plugin install pattern:
- `ProTable` — config-driven table wrapper around `el-table` with built-in search form and pagination
- `SearchForm` — standardized search form
- `SvgIcon` — SVG sprite icon component (icons in `src/assets/icons/`)
- `IconifyIcon` — Iconify icon component
- `SwitchDark` — dark mode toggle

### Styling

- SCSS with global variables injected via `vite.config.ts` (`src/styles/variable.scss`).
- Element Plus theme overrides in `src/styles/element.scss`.
- Path alias: `@` → `src/`.

### Mock Data

`vite-plugin-mock` is active only in dev mode. Mock files live in the project root `mock/` directory. Mock and real API can coexist — differentiate by URL prefix.

### Environment Variables

Files: `.env.development`, `.env.production`, `.env.test`. All custom vars must be prefixed with `VITE_` to be exposed. Key vars: `VITE_APP_BASE_URL`, `VITE_APP_TITLE`.

## Backend API Docs

Swagger documentation:
- `http://139.198.163.91:8080/doc.html#/home`
- `http://139.198.127.41:8080/doc.html#/home`
