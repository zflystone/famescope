# FameScope

> 每天 5 分钟，掌握你关注领域里最有影响力的人都说了什么。

FameScope 是一个手机端 PWA，帮你从噪音里提炼信号——追踪任意领域（AI、加密、太空科技等）的关键人物和官方账号，用 AI 提炼每日动态，而不只是信息聚合。

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Supabase](https://img.shields.io/badge/Supabase-Postgres-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

## 功能

- **信号流** — 追踪人物/机构的 X 推文和官方博客，AI 翻译并评分
- **每日简报** — AI 按人物维度提炼过去 24 小时的核心内容
- **发现页** — 搜索领域或人名，两步法推荐（AI 召回 + 真实数据核实）
- **PWA** — 可安装到手机桌面，支持 Web Push 推送通知
- **深色模式** — 支持浅色/深色切换

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端/后端 | Next.js 14 (App Router) + TypeScript |
| 样式 | Tailwind CSS（移动优先） |
| 数据库 | Supabase (Postgres + Auth) |
| AI | DeepSeek API（OpenAI 兼容接口） |
| X 数据 | TwitterAPI.io |
| PWA | Serwist |

## 本地运行

### 前置条件

- Node.js 18+
- Supabase 项目（[supabase.com](https://supabase.com)）
- DeepSeek API Key（[platform.deepseek.com](https://platform.deepseek.com)）
- TwitterAPI.io Key（[twitterapi.io](https://twitterapi.io)）

### 安装

```bash
git clone https://github.com/your-username/famescope.git
cd famescope
npm install
```

### 配置环境变量

```bash
cp .env.example .env.local
```

编辑 `.env.local`，填入你自己的 key（参考 `.env.example` 中的说明）。

### 数据库初始化

在 Supabase SQL 编辑器中执行以下建表语句：

```sql
-- 信源表
create table source (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('person', 'org')),
  name_en text not null,
  name_zh text,
  company text,
  title text,
  x_handle text,
  rss_url text,
  avatar_url text,
  score_influence numeric default 0,
  score_relevance numeric default 0,
  score_activity numeric default 0,
  last_fetched_at timestamptz,
  created_at timestamptz default now()
);

-- 内容表
create table post (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references source(id) on delete cascade,
  content_type text not null check (content_type in ('tweet', 'article')),
  x_tweet_id text unique,
  original_text text,
  relation_type text check (relation_type in ('original', 'reply', 'quote', 'retweet')),
  relation_target text,
  quoted_tweet_id text,
  quoted_text text,
  title text,
  title_zh text,
  article_url text unique,
  summary_zh text,
  signal_hint text,
  score numeric default 5,
  tags text[],
  domain text,
  has_opinion boolean default true,
  media_url text,
  media_is_video boolean default false,
  media_aspect_ratio numeric,
  published_at timestamptz not null,
  created_at timestamptz default now()
);

-- 用户追踪关系表
create table user_source (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  source_id uuid references source(id) on delete cascade,
  notify boolean default false,
  followed_at timestamptz default now(),
  unique(user_id, source_id)
);

-- 用户收藏表
create table user_post_state (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  post_id uuid references post(id) on delete cascade,
  is_starred boolean default false,
  unique(user_id, post_id)
);

-- 每日简报表
create table digest (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  generated_at timestamptz default now(),
  content jsonb not null
);

-- Web Push 订阅表
create table push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  endpoint text unique not null,
  p256dh text not null,
  auth text not null,
  created_at timestamptz default now()
);

-- 系统设置表
create table system_settings (
  key text primary key,
  value jsonb,
  updated_at timestamptz default now()
);

-- 统计注册用户数的函数（供管理面板使用）
create or replace function count_auth_users()
returns bigint language sql security definer set search_path = auth
as $$ select count(*) from auth.users; $$;
```

### 启动开发服务器

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)

## 部署

支持部署到任意 Node.js 环境（Vercel / 自建服务器 + PM2）。

```bash
npm run build
npm start
```

## 项目结构

```
src/
├── app/
│   ├── api/          # 后端接口（采集、AI处理、推送等）
│   └── (pages)       # 前端页面
├── components/
│   ├── feed/         # 信号流组件
│   ├── digest/       # 简报组件
│   ├── discover/     # 发现页组件
│   ├── admin/        # 管理面板
│   └── auth/         # 登录组件
└── lib/
    ├── ai/           # AI 处理逻辑
    ├── datasource/   # 数据源接口（可替换）
    ├── supabase/     # Supabase 客户端
    └── prompts.ts    # 所有 DeepSeek 提示词
```

## License

[MIT](LICENSE)
