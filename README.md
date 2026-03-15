# 海洋班级园 - React + TypeScript 重构版

基于 React + TypeScript + React Router + Ant Design + SCSS 重构的教育管理系统。

## 技术栈

- **React 18** - UI 框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **React Router v6** - 路由管理
- **Ant Design v5** - UI 组件库
- **SCSS** - 样式预处理器

## 项目结构

```
edu-admin-web/
├── src/
│   ├── components/          # 公共组件
│   │   ├── Header/          # 顶部导航
│   │   └── Modals/          # 弹窗组件
│   ├── pages/               # 页面组件
│   │   ├── Login/           # 登录/注册
│   │   ├── ClassSelect/     # 班级选择
│   │   ├── Setup/           # 班级初始化
│   │   └── Dashboard/       # 主管理页面
│   ├── hooks/               # 自定义 Hooks
│   │   ├── useAuth.ts       # 认证逻辑
│   │   └── useClassData.ts  # 班级数据管理
│   ├── services/            # 服务层
│   │   └── storage.ts       # localStorage 封装
│   ├── styles/              # 全局样式
│   │   ├── variables.scss   # SCSS 变量
│   │   └── global.scss      # 全局样式
│   ├── types/               # TypeScript 类型
│   │   └── index.ts         # 类型定义
│   ├── utils/               # 工具函数
│   │   └── helpers.ts       # 辅助函数
│   ├── App.tsx              # 应用入口
│   └── main.tsx             # 渲染入口
├── package.json
├── tsconfig.json
├── vite.config.ts
└── index.html
```

## 功能模块

### 1. 用户认证
- 用户注册（含密保问题）
- 用户登录
- 忘记密码（通过密保找回）
- 退出登录

### 2. 班级管理
- 创建新班级
- 选择已有班级
- 班级基础信息设置

### 3. 班级初始化设置
- 班级名称设置
- 成长阶段配置（5个阶段阈值）
- 加分/扣分项目配置（1-15个）
- 学生名单管理（批量导入/单个添加）
- 分组管理（启用/禁用分组，添加/删除分组）
- 奖励兑换设置

### 4. 主管理功能
- 学生列表展示（支持按分组筛选和搜索）
- 学生积分调整（+5/-5 快捷操作）
- 批量加减分（按分组或全部）
- 宠物系统（喂食、成长、毕业）
- 快捷喂食栏（点击直接喂食）
- 海族馆（展示学生的宠物）
- 领养新宠物
- 听海小铺（奖励兑换）
- 海洋之星（徽章排行榜）
- 操作撤回功能
- 设置修改

## 数据持久化

使用 localStorage 存储用户数据和班级数据，兼容原版的存储格式。

## 安装和运行

### 1. 安装依赖

```bash
cd edu-admin-web
npm install
```

### 2. 开发模式运行

```bash
npm run dev
```

### 3. 构建生产版本

```bash
npm run build
```

### 4. 预览生产版本

```bash
npm run preview
```

## 代码优化点

与原 HTML 版本相比，重构版本有以下改进：

1. **组件化架构** - 将页面拆分为多个可复用的组件
2. **类型安全** - 使用 TypeScript 提供完整的类型定义
3. **状态管理** - 使用自定义 Hooks 管理状态和逻辑
4. **路由管理** - 使用 React Router 实现页面导航
5. **UI 组件库** - 使用 Ant Design 提供一致的交互体验
6. **样式模块化** - 使用 SCSS 模块化管理样式
7. **代码复用** - 提取公共逻辑到 Hooks 和工具函数
8. **响应式设计** - 适配不同屏幕尺寸
9. **性能优化** - 使用 useMemo 等优化渲染性能

## 与原版的兼容性

- 数据存储格式与原版兼容，可以使用原版的 localStorage 数据
- 保持相同的业务逻辑和数据结构
- 优化了用户体验和界面交互
