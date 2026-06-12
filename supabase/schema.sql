-- FameScope Database Schema
-- 在 Supabase Dashboard > SQL Editor 中执行此文件

-- ============================================================
-- 内容层（所有用户共享，post 只存一份，AI 只处理一次）
-- ============================================================

create table if not exists public.source (
  id              uuid primary key default gen_random_uuid(),
  type            text not null check (type in ('person', 'org')),
  name_zh         text,                  -- 中文译名（个人）
  name_en         text not null,
  company         text,                  -- 所属公司 / 机构名
  title           text,                  -- 职位
  x_handle        text unique,           -- X @username（不带@）
  rss_url         text,                  -- 官方博客 RSS（org 用）
  avatar_tint     text default '#534ab7', -- 头像背景色
  x_followers_count  integer,
  x_verified      boolean default false,
  score_influence numeric(4,2) default 0, -- 影响力
  score_relevance numeric(4,2) default 0, -- 相关性
  score_activity  numeric(4,2) default 0, -- 活跃度
  last_fetched_at timestamptz,
  created_at      timestamptz default now()
);

create table if not exists public.post (
  id              uuid primary key default gen_random_uuid(),
  source_id       uuid not null references public.source(id) on delete cascade,
  content_type    text not null check (content_type in ('tweet', 'article')),

  -- tweet 专属字段
  x_tweet_id      text unique,           -- 用于去重
  original_text   text,                  -- 推文英文原文
  relation_type   text check (relation_type in ('original', 'reply', 'quote')),
  relation_target text,                  -- 被回复/引用的人名
  quoted_tweet_id text,                  -- 引用的推文 ID
  quoted_text     text,                  -- 引用推文原文

  -- article 专属字段
  title           text,
  title_zh        text,                  -- AI 生成的中文标题
  article_url     text,

  -- AI 处理结果（三种处理方式对应不同字段）
  summary_zh      text,      -- 中文摘要/直译（推文：一两句；文章：150-200字）
  signal_hint     text,      -- 为什么值得看（仅文章和简报用，推文卡片不展示）
  score           integer check (score between 1 and 10),
  tags            text[],
  domain          text,      -- AI 归类领域（AI / 加密 / 太空等）
  has_opinion     boolean,   -- AI 判断是否含实质观点（推文过滤用）

  -- 媒体（只存 URL，不下载）
  media_url       text,
  media_is_video  boolean default false,
  media_aspect_ratio numeric(4,2),

  published_at    timestamptz not null,
  created_at      timestamptz default now()
);

-- ============================================================
-- 用户行为层（每人独立，不互相影响）
-- ============================================================

create table if not exists public.user_source (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  source_id   uuid not null references public.source(id) on delete cascade,
  notify      boolean default false,   -- 实时提醒开关
  followed_at timestamptz default now(),
  unique(user_id, source_id)
);

create table if not exists public.user_post_state (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  post_id    uuid not null references public.post(id) on delete cascade,
  is_starred boolean default false,
  created_at timestamptz default now(),
  unique(user_id, post_id)
);

-- 每日简报（永久归档，不删除）
create table if not exists public.digest (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  generated_at timestamptz default now(),
  content      jsonb not null   -- 结构化简报内容
);

-- ============================================================
-- 索引（性能）
-- ============================================================

create index if not exists post_source_published on public.post(source_id, published_at desc);
create index if not exists post_type_published   on public.post(content_type, published_at desc);
create index if not exists post_domain           on public.post(domain);
create index if not exists user_source_user      on public.user_source(user_id);
create index if not exists user_source_source    on public.user_source(source_id);
create index if not exists user_post_state_user  on public.user_post_state(user_id);
create index if not exists digest_user_date      on public.digest(user_id, generated_at desc);

-- ============================================================
-- Row Level Security（RLS）
-- ============================================================

alter table public.source          enable row level security;
alter table public.post            enable row level security;
alter table public.user_source     enable row level security;
alter table public.user_post_state enable row level security;
alter table public.digest          enable row level security;

-- source/post：所有已登录用户可读（内容是共享的）
create policy "source: authenticated read"
  on public.source for select to authenticated using (true);

create policy "post: authenticated read"
  on public.post for select to authenticated using (true);

-- user_source：用户只能操作自己的
create policy "user_source: own all"
  on public.user_source for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- user_post_state：用户只能操作自己的
create policy "user_post_state: own all"
  on public.user_post_state for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- digest：用户只能读自己的（写入由 service_role 的 Cron 完成）
create policy "digest: own read"
  on public.digest for select to authenticated
  using (auth.uid() = user_id);

-- push_subscriptions：存储 Web Push 订阅信息
create table if not exists public.push_subscriptions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  endpoint    text not null unique,
  p256dh      text not null,
  auth        text not null,
  updated_at  timestamptz not null default now()
);

create index if not exists push_subscriptions_user_id_idx on public.push_subscriptions(user_id);

-- service_role 可写，普通用户不能直接读写
alter table public.push_subscriptions enable row level security;
