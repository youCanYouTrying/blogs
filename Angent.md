# 个人博客项目（Next.js + GSAP）

## 项目概述

技术栈为 **Next.js 14+ App Router + Tailwind CSS + GSAP** 的个人博客，部署在百度云 Linux 服务器（Node.js + MySQL 环境），使用 PM2 + Nginx 自托管，**不使用 Vercel**。

文章内容通过博客内置的 `/admin` 后台在线编辑发布（Tiptap 富文本编辑器），数据存储在 MySQL，**不使用本地 Markdown 文件**。

评论无需登录，任何人填写昵称即可发表，内容经敏感词过滤后直接发布。用户体系仅用于后台管理，注册填邮箱+用户名+密码即可，无验证码。

---

## 技术栈

| 层级         | 方案                                                            |
| ------------ | --------------------------------------------------------------- |
| 框架         | Next.js 14+（App Router，不用 Pages Router）                    |
| 样式         | Tailwind CSS + `@tailwindcss/typography`（文章正文 prose 排版） |
| 动画         | GSAP + ScrollTrigger（首页核心动画）                            |
| 数据库       | MySQL 8.0+                                                      |
| ORM          | Prisma                                                          |
| 富文本编辑器 | Tiptap（开源，React 原生集成）                                  |
| 代码高亮     | Tiptap `lowlight` 扩展（编辑器内）+ `shiki`（前台展示）         |
| 敏感词       | `sensitive-word`（本地开源库，免费，无需收费接口）              |
| 搜索         | MySQL FULLTEXT 全文索引 或 前端 `fuse.js`                       |
| 图片上传     | 存服务器本地 `public/uploads/`，API Route 接收 multipart        |
| 主题切换     | `next-themes`                                                   |
| 进程管理     | PM2                                                             |
| 反向代理     | Nginx                                                           |

**移除的依赖：** `nodemailer`、`next-auth`、`EmailVerification` 表，无任何第三方登录和邮件服务。

---

## 目录结构

```
/
├── app/
│   ├── page.tsx                        # 首页（文章列表 + GSAP 动画）
│   ├── posts/[slug]/page.tsx           # 文章详情页
│   ├── about/page.tsx                  # 关于我
│   ├── tags/[tag]/page.tsx             # 标签筛选页
│   ├── admin/                          # 后台管理（独立密码保护）
│   │   ├── layout.tsx                  # Admin 鉴权守卫
│   │   ├── page.tsx                    # 后台首页（文章列表管理）
│   │   ├── login/page.tsx             # 后台登录页
│   │   ├── posts/new/page.tsx          # 新建文章
│   │   └── posts/[id]/edit/page.tsx    # 编辑文章
│   ├── api/
│   │   ├── admin/
│   │   │   ├── posts/route.ts          # 文章 CRUD（需 admin token）
│   │   │   ├── login/route.ts          # 后台登录
│   │   │   └── upload/route.ts         # 图片上传（需 admin token）
│   │   ├── comments/route.ts           # 评论读写（无需登录，敏感词过滤）
│   │   └── views/route.ts             # 文章浏览量
│   ├── layout.tsx                      # 全局布局 + 页面过渡动画
│   ├── sitemap.ts                      # 自动生成 sitemap.xml
│   └── globals.css
├── components/
│   ├── Navbar.tsx                      # 导航栏
│   ├── Footer.tsx
│   ├── PostCard.tsx                    # 文章卡片（ScrollTrigger 淡入）
│   ├── HeroSection.tsx                 # 首页 Hero（GSAP 文字入场）
│   ├── TableOfContents.tsx             # 文章 TOC 目录
│   ├── CommentSection.tsx              # 评论区（无需登录，填昵称直接发）
│   └── admin/
│       ├── Editor.tsx                  # Tiptap 富文本编辑器封装
│       └── PostForm.tsx                # 文章表单
├── lib/
│   ├── prisma.ts                       # Prisma client 单例
│   ├── admin-auth.ts                   # Admin JWT 签发/校验工具函数
│   └── sensitive.ts                    # 敏感词过滤封装
├── prisma/
│   └── schema.prisma
└── public/
    └── uploads/
```

---

## 数据库 Schema（prisma/schema.prisma）

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model Post {
  id          Int       @id @default(autoincrement())
  title       String
  slug        String    @unique
  content     String    @db.LongText
  summary     String?   @db.Text
  coverImage  String?
  category    String?
  published   Boolean   @default(false)
  views       Int       @default(0)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  tags        Tag[]     @relation("PostTags")
  comments    Comment[]
}

model Tag {
  id    Int    @id @default(autoincrement())
  name  String @unique
  posts Post[] @relation("PostTags")
}

model Comment {
  id        Int      @id @default(autoincrement())
  content   String   @db.Text
  nickname  String                // 游客填写的昵称，不关联用户表
  postId    Int
  post      Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
}
```

**注意：** 无 `User` 表，无 `EmailVerification` 表，Schema 保持最简。

---

## 评论系统

评论**无需任何登录**，游客填写昵称和内容即可发表：

- 前端：`CommentSection.tsx` 提供昵称输入框 + 内容输入框 + 提交按钮
- 接口：`POST /api/comments`，参数 `{ postId, nickname, content }`
- 昵称不能为空，内容不能为空，最大长度 500 字
- 提交前在服务端用 `sensitive-word` 过滤内容，命中则返回错误提示，不入库
- 评论展示：按时间倒序，显示昵称、时间、内容，**无头像**

---

## 后台 /admin 鉴权方案

Admin 后台使用**环境变量密码**保护，与评论区完全无关。

**流程：**

1. 访问任意 `/admin/*` 路由，`admin/layout.tsx` 检查 cookie 中的 admin JWT
2. 未登录跳转到 `/admin/login`
3. 输入密码 → `POST /api/admin/login` 与 `ADMIN_PASSWORD` 对比 → 写入 HTTP-only cookie（签名 JWT）
4. 所有 `/api/admin/*` 接口在内部独立校验 admin token，不依赖前端守卫

---

## Tiptap 编辑器配置

在 `components/admin/Editor.tsx` 中配置以下扩展：

```
必须启用：
- StarterKit（段落、标题 H1-H4、粗体、斜体、列表、引用、分割线）
- Image（图片上传到 /api/admin/upload 后插入 URL）
- Link（超链接，支持新窗口打开）
- CodeBlockLowlight（代码块 + 语法高亮）
- Placeholder（空内容提示文字）

可选扩展：
- TextAlign（文本对齐）
- Underline（下划线）
- Table（表格）
```

Tiptap 输出 **HTML 字符串**，存入 MySQL `content` 字段（LongText）。前台用 `dangerouslySetInnerHTML` 渲染，外层加 Tailwind `prose prose-neutral` 类排版。

---

## 图片上传规范

- 接口：`POST /api/admin/upload`，需 admin token，接收 `multipart/form-data`
- 存储：`public/uploads/YYYY-MM/时间戳_原文件名.ext`
- 返回：`{ url: "/uploads/YYYY-MM/filename.ext" }`
- 限制：单文件最大 5MB，仅允许 `image/jpeg`、`image/png`、`image/webp`、`image/gif`

---

## 动画规范（GSAP）

首页动画是重要的视觉特色，**界面清新，滚动有动画，交互细节丰富**。

### 必须实现

- **Hero 区域**：标题文字逐行入场（`gsap.from` + `stagger`），副标题和 CTA 按钮延迟跟入
- **文章卡片列表**：`ScrollTrigger` 触发，卡片依次淡入上移（`stagger: 0.1`）
- **导航栏**：页面加载后从顶部滑入；滚动时背景从透明渐变为毛玻璃（`backdrop-blur`）
- **页面路由切换**：`layout.tsx` 中实现全局淡出 → 淡入过渡

### 可选增强

- 鼠标跟随光晕（`mousemove` + `gsap.quickTo`）
- 磁吸按钮（hover 时跟随鼠标轻微位移）
- 标签 hover 弹性缩放（`elastic` easing）
- 数字滚动计数动画（文章数、访问量等）

### 注意事项

- GSAP 动画只在客户端执行，相关组件顶部加 `"use client"`
- `useEffect` cleanup 必须调用 `ScrollTrigger.kill()` 防止内存泄漏
- 动画时长控制在 `0.4s ~ 0.8s`

---

## 部署方式

**环境**：百度云 Linux，Node.js + MySQL 8.0，不使用 Docker 和 Vercel。

```bash
# 1. 服务器安装 MySQL（Ubuntu）
apt install mysql-server && mysql_secure_installation

# 2. 创建数据库和用户
mysql -u root -p
> CREATE DATABASE blog CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
> CREATE USER 'blog'@'localhost' IDENTIFIED BY 'db_password';
> GRANT ALL PRIVILEGES ON blog.* TO 'blog'@'localhost';

# 3. 本地构建，上传到服务器
#    上传内容：.next/  public/  prisma/  package.json  .env

# 4. 服务器安装依赖 + 数据库迁移
npm install --production
npx prisma migrate deploy

# 5. PM2 启动
npm install -g pm2
pm2 start npm --name blog -- start
pm2 save && pm2 startup

# 6. Nginx 反向代理 3000 端口到 80/443
# 7. SSL：certbot --nginx（需域名已解析到服务器 IP）
```

---

## 功能优先级

### 🔴 核心功能（MVP，先实现）

1. 首页文章列表：封面图、标题、摘要、发布时间、标签
2. 文章详情页：HTML 渲染 + Tailwind prose 排版 + TOC 目录
3. 首页 GSAP 动画（Hero 入场 + 卡片 ScrollTrigger 淡入）
4. 全局导航栏 + 响应式布局 + 页脚
5. `/admin` 后台：密码登录 + 文章 CRUD + Tiptap 编辑器 + 图片上传
6. 评论区：填昵称直接发，敏感词过滤
7. 关于我页面
8. SEO：Metadata API + Open Graph + sitemap.xml

### 🟡 重要功能（第二阶段）

9. 标签页 / 分类页
10. 文章搜索
11. 阅读体验：进度条、预计阅读时间、代码复制按钮
12. 页面路由切换过渡动画

### 🟢 增强功能（持续迭代）

13. 深色 / 浅色模式（`next-themes`）
14. 项目展示页（Portfolio）
15. 归档页（按年月，时间轴样式）
16. 文章浏览量统计
17. RSS 订阅
18. 自定义 404 页面（带趣味动画）
19. 骨架屏 Loading 状态

---

## 代码风格

- 语言：**TypeScript**，所有文件使用 `.ts` / `.tsx`
- 组件：函数式组件 + React Hooks，不使用 Class 组件
- 客户端组件：需要 `useState` / `useEffect` / GSAP / Tiptap 的组件顶部加 `"use client"`
- 服务端组件：Prisma 查询尽量放在 Server Component 中，不在客户端暴露数据库逻辑
- Admin 接口安全：每个 `/api/admin/*` 路由必须独立校验 admin token，不依赖前端路由守卫
- 文章正文：外层加 `prose prose-neutral` 类，不写自定义文章样式
- 命名：组件 PascalCase，函数/变量 camelCase，数据库 model PascalCase

---

## 环境变量（.env）

```env
# 数据库
DATABASE_URL="mysql://blog:db_password@localhost:3306/blog"

# 后台 Admin
ADMIN_PASSWORD="your_strong_admin_password"
ADMIN_JWT_SECRET="random_jwt_secret_32chars"
```
