# Supabase 练手项目 - Windsurf Prompt V1

## 项目目标

使用 Windsurf 运行自动生成一个基于 Supabase 的练手项目，前后端使用 TypeScript，首先在本地使用 Supabase Docker 镜像部署后端，开发完成后可一键部署到 Supabase 云端环境。

## 功能模块与分工

### 1. 数据库结构

* 表 User

  * id (UUID)
  * email (unique)
  * created\_at (timestamp)
* 表 Todo

  * id (UUID)
  * user\_id (foreign key to User)
  * title (text)
  * is\_done (boolean)
  * created\_at (timestamp)

### 2. 后端 API (src/api/\*.ts)

* `/api/todo/list` - 获取当前用户的 todo 列表
* `/api/todo/create` - 新增 todo
* `/api/todo/toggle` - 切换 todo 状态 (done/未 done)
* `/api/todo/delete` - 删除 todo

### 3. 前端页面 (src/pages/\*.tsx)

* `/` - Login / Signup page
* `/todos` - Todo List page (可创建、切换、删除 todo)

### 4. 安全性

* 使用 Supabase Auth 支持 Email/Password 登录
* JWT 验证 API 接口

### 5. 测试

* Jest + ts-jest 基本单元测试
* Playwright 自动化 E2E 测试

### 6. CI/CD

* GitHub Actions 配置，自动测试 & 部署
* Supabase CLI 自动 push 到 Supabase Cloud

## 技术约束

* TypeScript （尽量使用构造类）
* 安装 supabase 本地 Docker 环境
* API 实现使用 Supabase JS Client
* React + Vite 开发前端
* TailwindCSS 样式

## 文件结构

```plaintext
/project-root
  /supabase
    docker-compose.yml
    supabase/config.toml
  /src
    /api
      todo.ts
    /pages
      index.tsx
      todos.tsx
    /components
      TodoItem.tsx
    main.tsx
    App.tsx
  /tests
    unit
    e2e
  package.json
  tsconfig.json
  README.md
  .github/workflows/ci.yml
```

## 注意事项

* 安装 supabase CLI： `npm install -g supabase`
* 本地测试时：先启动 supabase 本地 docker 环境：`supabase start`
* 部署时： `supabase db push && supabase functions deploy`

## 测试与部署建议

* Jest 要清楚分离 API 测试 vs UI 测试
* Playwright 要清楚先添加 Login 模块，先清理 supabase 数据库再进行测试
* GitHub Actions 建议配置好 secrets，包括 SUPABASE\_ACCESS\_TOKEN 等，保障自动部署流程通畅

## 排序原因解释

1. 先确定数据结构，为全部功能打基础
2. 先做 API，确保数据处理正确
3. 做前端页面，连通 API，实现操作流程
4. 加入安全验证，确保每个 API 需要合法身份操作
5. 最后搭建测试和 CI/CD 流程，保障进入持续集成模式

