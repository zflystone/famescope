"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { IconLoader2 } from "@tabler/icons-react";
import type { FeedTweet, FeedArticle } from "@/lib/fixtures/feed";
import TweetCard from "./TweetCard";
import NewsCard from "./NewsCard";

type MainTab = "social" | "news";
type Filter = "all" | "starred" | "opinion";

const SOCIAL_FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "starred", label: "收藏" },
  { key: "opinion", label: "含观点" },
];

const NEWS_FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "starred", label: "收藏" },
];

type FeedItem = FeedTweet | FeedArticle;

// 模块级缓存：导航离开再回来时直接显示缓存，不重新拉数据
const feedCache: Record<string, { items: FeedItem[]; total: number; ts: number }> = {};
const CACHE_TTL = 3 * 60 * 1000; // 3 分钟

export default function FeedView() {
  const [tab, setTab] = useState<MainTab>("social");
  const [socialFilter, setSocialFilter] = useState<Filter>("all");
  const [newsFilter, setNewsFilter] = useState<Filter>("all");
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(0);
  const [unreadSocial, setUnreadSocial] = useState(0);
  const [unreadNews, setUnreadNews] = useState(0);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const activeFilter = tab === "social" ? socialFilter : newsFilter;
  const setFilter = tab === "social" ? setSocialFilter : setNewsFilter;
  const filters = tab === "social" ? SOCIAL_FILTERS : NEWS_FILTERS;

  const loadFeed = useCallback(async (
    currentTab: MainTab,
    currentFilter: Filter,
    pageNum = 0,
    append = false,
  ) => {
    const key = `${currentTab}:${currentFilter}`;

    // 首屏有缓存且未过期，直接用缓存
    if (pageNum === 0 && !append) {
      const cached = feedCache[key];
      if (cached && Date.now() - cached.ts < CACHE_TTL) {
        setItems(cached.items);
        setHasMore(false); // 从缓存恢复时保守处理，不预设更多
        setLoading(false);
        return;
      }
    }

    if (pageNum === 0) setLoading(true);
    else setLoadingMore(true);

    try {
      const res = await fetch(
        `/api/feed?tab=${currentTab}&filter=${currentFilter}&page=${pageNum}`
      );
      if (res.ok) {
        const data = await res.json();
        const newItems: FeedItem[] = data.items ?? [];
        if (append) {
          setItems((prev) => [...prev, ...newItems]);
        } else {
          setItems(newItems);
          feedCache[key] = { items: newItems, total: data.total ?? 0, ts: Date.now() };
        }
        setHasMore(data.hasMore ?? false);
      }
    } finally {
      if (pageNum === 0) setLoading(false);
      else setLoadingMore(false);
    }
  }, []);

  // 未读数（初次挂载拉一次）
  useEffect(() => {
    async function loadCounts() {
      const [s, n] = await Promise.all([
        fetch("/api/feed?tab=social&filter=all&page=0").then((r) => r.json()),
        fetch("/api/feed?tab=news&filter=all&page=0").then((r) => r.json()),
      ]);
      setUnreadSocial(s.total ?? 0);
      setUnreadNews(n.total ?? 0);
    }
    loadCounts();
  }, []);

  // tab / filter 切换时重置并加载第一页
  useEffect(() => {
    setPage(0);
    loadFeed(tab, activeFilter, 0, false);
  }, [tab, activeFilter, loadFeed]);

  // page 增加时追加加载
  useEffect(() => {
    if (page > 0) loadFeed(tab, activeFilter, page, true);
  }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  // IntersectionObserver 滚动到底部时自动加载下一页
  useEffect(() => {
    if (!hasMore || loadingMore) return;
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setPage((p) => p + 1); },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasMore, loadingMore]);

  return (
    <>
      {/* 主 tab */}
      <div className="sticky top-14 z-10 border-b border-line bg-page">
        <div className="mx-auto flex max-w-app gap-6 px-page">
          <TabButton
            label="社交动态"
            count={unreadSocial}
            active={tab === "social"}
            onClick={() => setTab("social")}
          />
          <TabButton
            label="官方新闻"
            count={unreadNews}
            active={tab === "news"}
            onClick={() => setTab("news")}
          />
        </div>

        {/* 过滤栏 */}
        <div className="no-scrollbar mx-auto flex max-w-app gap-2 overflow-x-auto px-page pb-2.5 pt-2.5">
          {filters.map((f) => {
            const isActive = activeFilter === f.key;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className={`shrink-0 rounded-pill px-3 py-1 text-meta font-medium transition-colors ${
                  isActive
                    ? "bg-brand text-brand-on"
                    : "bg-surface text-content-secondary"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 卡片列表 */}
      <div className="mx-auto max-w-app px-page py-3">
        {loading ? (
          <div className="flex justify-center py-20">
            <IconLoader2 size={24} stroke={2} className="animate-spin text-content-tertiary" />
          </div>
        ) : items.length > 0 ? (
          <>
            <div className="space-y-cardgap">
              {items.map((item) =>
                item.contentType === "tweet" ? (
                  <TweetCard key={item.id} tweet={item as FeedTweet} />
                ) : (
                  <NewsCard key={item.id} article={item as FeedArticle} />
                )
              )}
            </div>
            {/* 无限滚动哨兵 */}
            <div ref={sentinelRef} className="h-4" />
            {loadingMore && (
              <div className="flex justify-center py-4">
                <IconLoader2 size={20} stroke={2} className="animate-spin text-content-tertiary" />
              </div>
            )}
            {!hasMore && items.length > 0 && (
              <p className="py-6 text-center text-tiny text-content-tertiary">已显示全部内容</p>
            )}
          </>
        ) : (
          <EmptyState tab={tab} filter={activeFilter} />
        )}
      </div>
    </>
  );
}

function TabButton({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex items-center gap-1.5 px-1 py-3 text-[15px]"
    >
      <span
        className={
          active ? "font-medium text-content-primary" : "text-content-secondary"
        }
      >
        {label}
      </span>
      {count > 0 && (
        <span className="flex h-4 min-w-4 items-center justify-center rounded-pill bg-brand-weak px-1 text-tiny font-semibold text-brand">
          {count}
        </span>
      )}
      {active && (
        <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-brand" />
      )}
    </button>
  );
}

function EmptyState({ tab, filter }: { tab: MainTab; filter: Filter }) {
  if (filter === "starred") {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-content-tertiary">
        <p className="text-meta">还没有收藏任何内容</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center text-content-tertiary">
      <p className="text-meta">
        {tab === "social" ? "暂无推文" : "暂无新闻"}
      </p>
      <p className="mt-1 text-tiny">
        去发现页添加信源，系统会自动采集内容
      </p>
    </div>
  );
}
