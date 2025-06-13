# Supabase + React/Vite 本地部署与开发 Workflow

## 1. 环境准备

### 1.1 安装依赖工具

- **Node.js**（建议用 nvm 管理）
- **npm** 或 **yarn**
- **Supabase CLI**  
  推荐 Homebrew 安装（macOS）：
  ```bash
  brew install supabase/tap/supabase
  ```

- **Docker**  
  Supabase 本地服务依赖 Docker，请确保 Docker Desktop 已启动。

---

## 2. 克隆/进入项目

```bash
git clone <your-repo-url>
cd supabase-try2
```

---

## 3. 安装依赖

```bash
npm install
```

---

## 4. 配置环境变量

在项目根目录下创建 `.env` 文件（如已存在可跳过），内容如下：

```env
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=<你的 anon key，见 supabase 启动日志>
```

> anon key 可在运行 `supabase start` 后的终端输出中找到。

---

## 5. 启动 Supabase 本地服务

```bash
npm run supabase:start
```
或直接
```bash
cd supabase
supabase start
```

- 启动后，主要服务端口：
  - API: http://localhost:54321
  - Studio: http://localhost:54323

---

## 6. 启动前端开发服务器

新开一个终端，进入项目根目录：

```bash
npm run dev
```

- 默认访问地址：http://localhost:3000

---

## 7. （可选）部署/测试 Edge Function

如果你有 Edge Function 需要部署（如 `supabase/functions/todo/index.ts`）：

```bash
cd supabase
supabase functions deploy todo
```
- 本地测试可用：
  ```bash
  supabase functions serve todo
  ```

---

## 8. 常见问题排查

- **页面空白/报错**：检查 `.env` 是否配置正确，Supabase 服务是否已全部启动。
- **端口冲突**：确保 54321、54323、3000 等端口未被其他应用占用。
- **数据库变更**：如有迁移，执行
  ```bash
  npm run supabase:db:push
  ```

---

## 9. 停止服务

- 前端：`Ctrl+C` 终止
- Supabase 后端：
  ```bash
  cd supabase
  supabase stop
  ```

---

## 10. 参考命令速查

```bash
# 启动 Supabase
npm run supabase:start

# 启动前端
npm run dev

# 部署 Edge Function
cd supabase
supabase functions deploy todo

# 数据库迁移
npm run supabase:db:push

# 停止 Supabase
cd supabase
supabase stop
```

---

如需云端部署，可补充 Netlify/Vercel/Render 等平台的相关说明。
