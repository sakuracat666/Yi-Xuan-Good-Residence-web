# 租房后台管理系统（rentHouseAdmin）

基于 Vue 3 + TypeScript + Vite 4 + Element Plus + Pinia 构建的租房业务后台管理系统。

# 前后端代码地址
后端地址：https://github.com/sakuracat666/Yi-Xuan-Good-Residence

前端管理端地址：https://github.com/sakuracat666/Yi-Xuan-Good-Residence-web

前端用户端地址：https://github.com/sakuracat666/Yi-Xuan-Good-Residence-h5

## 技术栈

| 分类 | 技术 |
|------|------|
| 框架 | Vue 3.3（Composition API + `<script setup>`） |
| 语言 | TypeScript 4.9 |
| 构建工具 | Vite 4.3 |
| UI 库 | Element Plus 2.3（中文语言包，全量注册） |
| 状态管理 | Pinia 2 + `pinia-plugin-persistedstate` 持久化插件 |
| 路由 | Vue Router 4（Hash 模式） |
| HTTP 请求 | Axios（二次封装，自动注入 `access-token`，统一拦截响应） |
| 图表 | ECharts 5 + vue-echarts + echarts-liquidfill |
| 地图 | 高德地图（`@amap/amap-jsapi-loader`） |
| 样式 | SCSS（全局注入 `variable.scss`） |
| 图标 | Iconify (`@iconify/vue`) + 自定义 SVG Icons (`vite-plugin-svg-icons`) |
| 代码规范 | ESLint + Prettier + Stylelint + Husky + lint-staged + Commitlint |

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器（默认 http://localhost:5173，代理 /admin → 后端）
npm run dev

# 构建生产包
npm run build

# 预览构建产物
npm run preview
```

### 代码质量

```bash
# ESLint 检查
npm run lint

# ESLint 自动修复
npm run fix

# Prettier 格式化全部文件
npm run format

# ESLint + Stylelint 联合修复
npm run lint:eslint
npm run lint:style
```

> 项目已配置 Husky + lint-staged，`git commit` 时会自动对暂存文件执行 ESLint / Stylelint / Prettier 检查。

## 环境配置

项目通过 `.env.*` 文件管理多环境变量，变量必须以 `VITE_` 为前缀才能在前端代码中访问。

| 文件 | 环境 | 后端接口地址（`VITE_APP_BASE_URL`） |
|------|------|------|
| `.env.development` | 开发 | `http://localhost:8081`（通过 Vite proxy 转发） |
| `.env.production` | 生产 | `http://admin.lease.atguigu.com` |
| `.env.test` | 测试 | `/dev-api` |

开发环境下，`/admin` 前缀的请求会被 Vite 开发服务器代理到 `VITE_APP_BASE_URL`，生产环境直接使用绝对地址。

## 项目架构

### 目录结构概览

```
src/
├── api/              # 接口层，按业务模块拆分，每个模块含 index.ts（请求）+ types.ts（类型）
├── assets/           # 静态资源：字体、SVG 图标、图片
├── components/       # 全局组件（ProTable、SearchForm、SvgIcon、SwitchDark、IconifyIcon 等）
├── config/           # 全局常量配置（路由白名单、首页地址、地图 Key 等）
├── directives/       # 自定义指令（v-auth 权限指令）
├── enums/            # 枚举（缓存键名、HTTP 状态码、业务常量）
├── hooks/            # 组合式函数（分页、数据处理、主题、地图等）
├── layouts/          # 布局模块（NavBar、SideBar、TabsBar、Main、Footer、Logo）
├── router/           # 路由（静态路由集中定义在 constantRoutes.ts）
├── store/            # Pinia 状态管理（user、settings、tabsBar）
├── styles/           # 全局样式（SCSS 变量、Element 覆盖、主题、重置）
├── typings/          # 全局 TypeScript 声明
├── utils/            # 工具函数（HTTP 封装、缓存、校验、事件总线、颜色等）
├── views/            # 页面视图，按业务模块组织
├── App.vue           # 根组件
└── main.ts           # 入口文件
```

### 核心设计

**路由与鉴权**
- 采用 Hash 模式路由，所有静态路由集中定义在 `src/router/constantRoutes.ts`。
- 路由守卫逻辑：登录页访问控制 → 白名单放行 → Token 校验（无 Token 跳转登录页并携带 redirect）。
- Token 通过 Pinia + 持久化插件存储，Axios 请求拦截器自动注入 `access-token` 请求头。

**HTTP 请求封装**
- 统一封装在 `src/utils/http/index.ts`，暴露 `get / post / put / delete` 泛型方法。
- 开发环境 `baseURL` 为 `/`（配合 Vite proxy），生产环境使用 `VITE_APP_BASE_URL`。
- 响应拦截器统一处理：Token 失效自动清除状态并跳转登录页，业务错误码弹出 ElMessage 提示。

**全局组件**
- `ProTable`：基于 Element Plus Table 的二次封装，支持配置化列定义、搜索表单、分页。
- `SearchForm`：统一搜索表单组件。
- `SvgIcon`：SVG 雪碧图图标组件，图标资源在 `src/assets/icons/`。
- `IconifyIcon`：Iconify 图标组件。
- `SwitchDark`：暗黑模式切换组件。

**API 层约定**
- 每个业务模块独立目录（如 `api/rentManagement/`），`index.ts` 导出请求方法，`types.ts` 定义接口类型。
- 请求方法统一使用 `http.get<T>()` / `http.post<T>()` 泛型调用，返回 `Promise<ResultData<T>>`。

**Mock 数据**
- 使用 `vite-plugin-mock`，仅在开发环境启用，Mock 文件放在项目根目录 `mock/` 下。

### 业务模块

| 模块 | 路由前缀 | 说明 |
|------|---------|------|
| 系统管理 | `/system/` | 用户管理、岗位管理 |
| 公寓管理 | `/apartmentManagement/` | 公寓管理、房间管理、属性管理 |
| 租房管理 | `/rentManagement/`、`/agreementManagement/` | 看房预约管理、租约管理 |
| 财务管理 | `/finance/` | 支付订单管理 |
| 用户管理 | `/userManagement/` | 前端用户管理 |
| 租户画像 | `/tenantProfile/` | 租户画像监控 |
| 报修管理 | `/repairManagement/` | 报修工单管理 |

## 接口文档

后端接口文档地址（Swagger）：
- `http://139.198.163.91:8080/doc.html#/home`
- `http://139.198.127.41:8080/doc.html#/home`
- `http://139.198.163.91:8081/doc.html#/home`
