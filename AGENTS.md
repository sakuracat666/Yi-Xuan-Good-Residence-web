# AGENTS.md

本文件为 Qoder (qoder.com) 在此仓库中工作时提供指引。

## 常用命令

```bash
# 安装依赖
npm install

# 启动开发服务器（Vite，默认端口 5173，代理 /admin 到后端）
npm run dev

# 生产构建
npm run build

# ESLint 检查 / 自动修复
npm run lint
npm run fix

# Prettier 格式化所有文件
npm run format

# ESLint + Stylelint 联合修复
npm run lint:eslint
npm run lint:style
```

项目未配置测试框架。

## 项目架构

**Vue 3 + TypeScript + Vite 4 + Element Plus + Pinia** — 租房后台管理系统。

### 请求层（`src/utils/http/index.ts`）

Axios 经二次封装，暴露泛型方法（`http.get<T>()`、`http.post<T>()` 等），返回 `Promise<ResultData<T>>`。核心行为：
- 开发环境：`baseURL` 为 `/`，Vite 将 `/admin` 前缀请求代理到 `VITE_APP_BASE_URL`（定义在 `.env.development`）。
- 生产环境：`baseURL` 直接使用 `.env.production` 中的绝对地址 `VITE_APP_BASE_URL`。
- 请求拦截器自动从 Pinia user store 读取 token 并注入 `access-token` 请求头。
- 响应拦截器统一处理：Token 失效时清除状态并跳转登录页；业务错误码通过 `ElMessage.error` 弹出提示。

### API 模块约定（`src/api/`）

每个业务模块独立目录，包含 `index.ts`（请求函数）和 `types.ts`（接口类型定义）。示例：`src/api/rentManagement/index.ts` + `types.ts`。

### 路由（`src/router/`）

- Hash 模式路由，所有路由集中定义在 `constantRoutes.ts`。
- 路由守卫逻辑（`index.ts`）：登录页访问控制 → 白名单放行 → Token 校验 → 无 Token 跳转登录页并携带 `redirect` 参数。
- 路由 `meta` 字段说明：`isHide`（侧边栏隐藏）、`activeMenu`（详情页高亮父菜单）、`isFull`（全屏）、`isAffix`（固定 Tab）、`isKeepAlive`（缓存）。

### 状态管理（`src/store/`）

Pinia + `pinia-plugin-persistedstate` 持久化插件。核心 store：
- `user.ts` — Token、用户信息（持久化存储）
- `settings.ts` — 主题与布局配置
- `tabsBar.ts` — 页签导航状态

### 全局组件（`src/components/`）

在 `main.ts` 中通过插件安装模式全局注册：
- `ProTable` — 基于 `el-table` 的配置化表格封装，内置搜索表单与分页
- `SearchForm` — 统一搜索表单组件
- `SvgIcon` — SVG 雪碧图图标组件（图标资源位于 `src/assets/icons/`）
- `IconifyIcon` — Iconify 图标组件
- `SwitchDark` — 暗黑模式切换组件

### 样式

- SCSS 预处理，全局变量通过 `vite.config.ts` 自动注入（`src/styles/variable.scss`）。
- Element Plus 主题覆盖样式在 `src/styles/element.scss`。
- 路径别名：`@` → `src/`。

### Mock 数据

`vite-plugin-mock` 仅在开发环境启用，Mock 文件位于项目根目录 `mock/`。Mock 与真实接口可共存，通过 URL 前缀区分。

### 环境变量

配置文件：`.env.development`、`.env.production`、`.env.test`。自定义变量必须以 `VITE_` 为前缀才能在前端代码中访问。关键变量：`VITE_APP_BASE_URL`（后端地址）、`VITE_APP_TITLE`（页面标题）。

## 后端接口文档

Swagger 文档地址：
- `http://139.198.163.91:8080/doc.html#/home`
- `http://139.198.127.41:8080/doc.html#/home`
