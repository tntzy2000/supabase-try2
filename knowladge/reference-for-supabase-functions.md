# Supabase Functions 本地联调 & 云端部署工作流指南

## 背景目标

* 开发阶段希望 Functions 本地联调，和本地 Supabase 服务（数据库、Storage 等）配合
* 开发完成后可以部署到 Supabase Cloud Functions，供正式环境调用
* 避免自行手写 Dockerfile 或复杂 container 过程，优先用官方推荐流程

---

## 1️⃣ 准备阶段

### 安装 Supabase CLI

```bash
npm install -g supabase
# 或用 Homebrew
brew install supabase/tap/supabase
```

### 启动本地 Supabase 服务

```bash
supabase start
```

* 启动后默认 URL:

  * API: [http://localhost:54321](http://localhost:54321)
  * Postgres: port 54322
  * Storage: 本地服务

---

## 2️⃣ 创建 Function

```bash
supabase functions new my-function-name
```

生成结构：

```
supabase/
  functions/
    my-function-name/
      index.ts
      deno.json
```

---

## 3️⃣ 本地联调 Function

### 启动 Function serve 模式

```bash
supabase functions serve my-function-name
```

* 本地 endpoint:
  `http://localhost:54321/functions/v1/my-function-name`

* 可通过 curl / Postman / 前端代码直接调用此 URL 进行联调测试

### 本地调用示例

```bash
curl -i --request POST \
  --header "Content-Type: application/json" \
  --data '{"key":"value"}' \
  http://localhost:54321/functions/v1/my-function-name
```

---

## 4️⃣ 部署到 Supabase Cloud

### 登录 Supabase 账号

```bash
supabase login
```

### Link 本地项目到 Cloud Project

```bash
supabase link --project-ref <your-project-ref>
```

* Project ref 可在 Supabase Cloud 控制台中查看，形如 `abcd1234xyz`

### 部署 Function

```bash
supabase functions deploy my-function-name
```

* 部署完成后 Cloud endpoint URL:

```
https://<your-project-ref>.functions.supabase.co/my-function-name
```

### 生产环境调用示例

```bash
curl -i --request POST \
  --header "Content-Type: application/json" \
  --header "Authorization: Bearer <anon-key-or-service-role-key>" \
  --data '{"key":"value"}' \
  https://<your-project-ref>.functions.supabase.co/my-function-name
```

---

## 5️⃣ 配置建议

### 环境配置 `.env` 示例

```dotenv
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_DB_URL=postgresql://postgres:postgres@localhost:54322/postgres
```

### 推荐文件结构

```
project-root/
  supabase/
    functions/
      my-function-name/
        index.ts
        deno.json
    config.toml
    .env
  frontend/
    ... (your frontend project)
  README.md
```

---

## 6️⃣ 小结流程图

### 本地开发时：

```txt
Frontend --> http://localhost:54321/functions/v1/my-function-name
                       ↑
          supabase functions serve my-function-name
```

### 部署后生产环境：

```txt
Frontend --> https://<project>.functions.supabase.co/my-function-name
                       ↑
          supabase functions deploy my-function-name
```

---

## 7️⃣ 重要注意事项

✅ 本地 serve 使用 CLI 内建 Deno runtime，不是 container
✅ Cloud Functions 部署由 Supabase 官方基础设施托管，非容器部署
✅ 开发阶段避免自行写 Dockerfile（除非有非常特殊需求）
✅ 本地环境和生产环境推荐通过 `.env` 配置切换，保持一致性
✅ 推荐统一使用 Supabase JS Client 访问 Postgres、Storage、Auth 服务，避免直接裸写 HTTP 调用

---

## 参考文档

* [https://supabase.com/docs/guides/functions](https://supabase.com/docs/guides/functions)
* [https://supabase.com/docs/guides/cli](https://supabase.com/docs/guides/cli)

---
