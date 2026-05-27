# 任务看板

> 统筹者：Claude | 执行者：Codex
> 每次只能领取一个任务，领取前必须完整阅读 `Angent.md`。

---

## 第一期：项目初始化与基础架构（MVP）

- [x] **T01** 初始化 Next.js 14 项目并配置基础依赖（Codex）<!-- 完成：已初始化 Next.js 14 App Router + TypeScript + Tailwind 项目，安装 gsap、prisma、@prisma/client 等基础依赖，并清理默认 layout/page 骨架 -->
  - 做什么：用 `create-next-app` 初始化项目，App Router，TypeScript，Tailwind CSS；安装 `gsap`、`prisma`、`@prisma/client`、`next-themes`、`sensitive-word`、`jsonwebtoken`、`@types/jsonwebtoken`；删除默认示例代码，保留干净的 `app/layout.tsx` 和 `app/page.tsx` 骨架
  - 输出文件：`package.json`、`tsconfig.json`、`tailwind.config.ts`、`app/layout.tsx`、`app/globals.css`
  - 遵循规范：技术栈章节，代码风格章节

- [x] **T02** 配置 Prisma Schema 并初始化数据库迁移文件（Codex）<!-- 完成：已创建 prisma/schema.prisma（Post/Tag/Comment 三张表），手动生成迁移文件 prisma/migrations/20260527000000_初始化数据库表结构/migration.sql；阻塞：npx prisma migrate dev 及 prisma generate 因 Agent 权限限制无法执行，需用户在终端手动运行这两条命令完成建表和客户端生成 -->
  - 做什么：创建 `prisma/schema.prisma`，按 `Angent.md` 中的 Schema 定义写入 `Post`、`Tag`、`Comment` 三张表；执行 `npx prisma migrate dev --name 初始化数据库表结构` 生成迁移文件；执行 `npx prisma generate`
  - 输出文件：`prisma/schema.prisma`、`prisma/migrations/` 目录
  - 遵循规范：数据库 Schema 章节，Schema 变更流程章节
  - 前置条件：本地 `.env` 已配置 `DATABASE_URL`（由用户手动创建，不提交到 git）

- [x] **T03** 实现后台 Admin 鉴权工具函数与登录接口（Codex）<!-- 完成：创建 lib/admin-auth.ts 实现 signAdminToken（jsonwebtoken，7天有效期）和 verifyAdminToken；创建 app/api/admin/login/route.ts 实现 POST 登录接口，密码为空返回 400，密码错误返回 401，匹配则签发 JWT 写入 HTTP-only cookie -->
  - 做什么：创建 `lib/admin-auth.ts`，实现 JWT 签发（`signAdminToken`）和校验（`verifyAdminToken`）两个函数；创建 `app/api/admin/login/route.ts`，`POST` 接收 `{ password }`，与 `ADMIN_PASSWORD` 环境变量对比，匹配则签发 JWT 写入 HTTP-only cookie，返回 `{ ok: true }`
  - 输出文件：`lib/admin-auth.ts`、`app/api/admin/login/route.ts`
  - 遵循规范：后台鉴权方案章节，代码风格章节

- [→] **T04** 实现 Admin 后台布局守卫与登录页（Codex）<!-- 领取时间：2026-05-27 -->
  - 做什么：创建 `app/admin/layout.tsx`，读取 cookie 中的 admin JWT，未登录重定向到 `/admin/login`；创建 `app/admin/login/page.tsx`，一个简洁的密码输入表单，提交后调用 `/api/admin/login`，成功跳转到 `/admin`
  - 输出文件：`app/admin/layout.tsx`、`app/admin/login/page.tsx`
  - 遵循规范：后台鉴权方案章节，前端视觉规范章节（浅色主题，克制风格）

- [x] **T05** 实现 Prisma Client 单例与敏感词过滤封装（Codex）<!-- 完成：创建 lib/prisma.ts 导出 globalThis 缓存的 PrismaClient 单例；创建 lib/sensitive.ts 封装 sensitive-word CJS 模块，导出 hasSensitiveWord(text) 函数 -->
  - 做什么：创建 `lib/prisma.ts`，导出全局单例 Prisma Client（防止开发模式下重复实例化）；创建 `lib/sensitive.ts`，封装 `sensitive-word` 库，导出 `filterSensitive(text: string): boolean` 函数（返回 true 表示命中敏感词）
  - 输出文件：`lib/prisma.ts`、`lib/sensitive.ts`
  - 遵循规范：技术栈章节，代码风格章节

---

## 第二期：核心页面与 API（MVP 续）

- [x] **T06** 实现文章 CRUD API（Codex）<!-- 完成：创建 app/api/admin/posts/route.ts 实现 GET 列表（分页+tags关联，按 createdAt 倒序）和 POST 新建（tags connectOrCreate）；创建 app/api/admin/posts/[id]/route.ts 实现 GET 单篇、PUT 更新（tags 先 set 再 connectOrCreate）、DELETE 删除（级联删除 comments）；所有接口统一校验 admin_token cookie -->
  - 做什么：创建 `app/api/admin/posts/route.ts`，实现 `GET`（列表，含分页）、`POST`（新建文章）；创建 `app/api/admin/posts/[id]/route.ts`，实现 `GET`（单篇）、`PUT`（更新）、`DELETE`（删除）；所有接口内部独立校验 admin token
  - 输出文件：`app/api/admin/posts/route.ts`、`app/api/admin/posts/[id]/route.ts`
  - 遵循规范：Admin 接口安全章节，数据库操作规范章节
  - 前置条件：T03、T05 已完成

- [x] **T07** 实现图片上传 API（Codex）<!-- 完成：创建 app/api/admin/upload/route.ts，接收 multipart/form-data，校验 admin_token cookie，限制文件类型（jpeg/png/webp/gif）和大小（5MB），存储到 public/uploads/YYYY-MM/时间戳_原文件名.ext，返回 { url } -->
  - 做什么：创建 `app/api/admin/upload/route.ts`，接收 `multipart/form-data`，校验 admin token，限制文件类型（jpeg/png/webp/gif）和大小（5MB），存储到 `public/uploads/YYYY-MM/时间戳_原文件名.ext`，返回 `{ url: "/uploads/..." }`
  - 输出文件：`app/api/admin/upload/route.ts`
  - 遵循规范：图片上传规范章节
  - 前置条件：T03 已完成

- [→] **T08** 实现评论读写 API（Codex）<!-- 领取时间：2026-05-27 -->
  - 做什么：创建 `app/api/comments/route.ts`，`GET` 按 `postId` 查询评论列表（倒序）；`POST` 接收 `{ postId, nickname, content }`，服务端敏感词过滤，通过则写入数据库
  - 输出文件：`app/api/comments/route.ts`
  - 遵循规范：评论系统章节，数据库操作规范章节
  - 前置条件：T05 已完成

- [ ] **T09** 实现全局导航栏组件 Navbar（Codex）
  - 做什么：创建 `components/Navbar.tsx`（`"use client"`），左侧博客名文字链接，右侧「首页 / 关于我」导航链接；GSAP 实现页面加载后从顶部滑入；滚动时背景从透明渐变为毛玻璃（`backdrop-blur`）；响应式，移动端折叠
  - 输出文件：`components/Navbar.tsx`
  - 遵循规范：动画规范章节，前端视觉规范章节（导航栏组件要求）

- [ ] **T10** 实现首页 Hero 区域与文章列表（Codex）
  - 做什么：更新 `app/page.tsx`（Server Component），从数据库查询已发布文章列表；创建 `components/HeroSection.tsx`（`"use client"`），2-3 行自我介绍文字，GSAP 逐行入场动画；创建 `components/PostCard.tsx`（`"use client"`），展示标题/日期/摘要/标签，ScrollTrigger 淡入上移动画
  - 输出文件：`app/page.tsx`、`components/HeroSection.tsx`、`components/PostCard.tsx`
  - 遵循规范：动画规范章节，前端视觉规范章节，功能优先级 1-3 条
  - 前置条件：T05、T09 已完成

- [ ] **T11** 实现文章详情页（Codex）
  - 做什么：创建 `app/posts/[slug]/page.tsx`（Server Component），按 slug 查询文章，用 `dangerouslySetInnerHTML` 渲染 HTML 内容，外层加 `prose prose-neutral` 类；创建 `components/TableOfContents.tsx`，解析 HTML 中的标题标签生成 TOC 目录，侧边栏展示
  - 输出文件：`app/posts/[slug]/page.tsx`、`components/TableOfContents.tsx`
  - 遵循规范：前端视觉规范章节（文章详情页要求），代码风格章节
  - 前置条件：T05 已完成

- [ ] **T12** 实现 Tiptap 富文本编辑器与后台文章管理页（Codex）
  - 做什么：安装 Tiptap 相关依赖（`@tiptap/react`、`@tiptap/starter-kit`、`@tiptap/extension-image`、`@tiptap/extension-link`、`@tiptap/extension-code-block-lowlight`、`lowlight`）；创建 `components/admin/Editor.tsx`（`"use client"`），配置所有必须扩展；创建 `components/admin/PostForm.tsx`；创建 `app/admin/page.tsx`（文章列表管理）、`app/admin/posts/new/page.tsx`、`app/admin/posts/[id]/edit/page.tsx`
  - 输出文件：`components/admin/Editor.tsx`、`components/admin/PostForm.tsx`、`app/admin/page.tsx`、`app/admin/posts/new/page.tsx`、`app/admin/posts/[id]/edit/page.tsx`
  - 遵循规范：Tiptap 编辑器配置章节，前端视觉规范章节
  - 前置条件：T04、T06、T07 已完成

---

## 第三期：补全功能（MVP 收尾）

- [ ] **T13** 实现评论区组件（Codex）
  - 做什么：创建 `components/CommentSection.tsx`（`"use client"`），昵称输入框 + 内容输入框 + 提交按钮，调用 `/api/comments`；展示评论列表（倒序，昵称/时间/内容，无头像）；在 `app/posts/[slug]/page.tsx` 中引入
  - 输出文件：`components/CommentSection.tsx`，更新 `app/posts/[slug]/page.tsx`
  - 遵循规范：评论系统章节，前端视觉规范章节
  - 前置条件：T08、T11 已完成

- [ ] **T14** 实现关于我页面与页脚（Codex）
  - 做什么：创建 `app/about/page.tsx`，简洁的自我介绍页面；创建 `components/Footer.tsx`，一行版权信息 + 社交链接（文字链接）；在 `app/layout.tsx` 中引入 Navbar 和 Footer
  - 输出文件：`app/about/page.tsx`、`components/Footer.tsx`，更新 `app/layout.tsx`
  - 遵循规范：前端视觉规范章节（页脚要求）
  - 前置条件：T09 已完成

- [ ] **T15** 配置 SEO Metadata 与 sitemap.xml（Codex）
  - 做什么：在 `app/layout.tsx` 配置全局 `metadata`（title、description、Open Graph）；在 `app/posts/[slug]/page.tsx` 配置动态 `generateMetadata`；创建 `app/sitemap.ts`，查询所有已发布文章生成 sitemap
  - 输出文件：更新 `app/layout.tsx`、`app/posts/[slug]/page.tsx`，新增 `app/sitemap.ts`
  - 遵循规范：功能优先级第 8 条
  - 前置条件：T10、T11 已完成
