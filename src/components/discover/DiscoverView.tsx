/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  IconSearch,
  IconRadar2,
  IconX,
  IconUsersGroup,
  IconBuildingCommunity,
  IconSparkles,
  IconLoader2,
} from "@tabler/icons-react";
import {
  quickDomains,
  detectInputType,
  formatFollowerLabel,
  handleToTint,
  type DiscoverSource,
  type DiscoverScore,
} from "@/lib/fixtures/discover";
import SourceResultCard from "./SourceResultCard";
import MySourceRow from "./MySourceRow";

type ResultTab = "persons" | "orgs";
type ViewState = "idle" | "scanning" | "domain" | "name" | "error";

// ─── API response → DiscoverSource ───────────────────────────────
function mapApiSource(s: any): DiscoverSource {
  const count: number = s.followersCount ?? 0;
  const handle: string = s.handle ?? "";

  const score: DiscoverScore = {
    influence: Math.min(100, Math.round((Math.log10(Math.max(count, 1)) / 8) * 100)),
    relevance: s.relevance ?? 72,
    activity: s.activity ?? 68,
  };

  return {
    id: `src-${handle}`,
    type: s.type ?? "person",
    nameEn: s.nameEn ?? handle,
    nameZh: s.nameZh ?? s.nameEn ?? handle,
    company: s.company ?? "",
    title: s.title ?? "",
    avatarTint: handleToTint(handle),
    avatarText: (s.nameEn ?? handle).slice(0, 1).toUpperCase(),
    handle: `@${handle}`,
    bio: s.description ?? "",
    followerLabel: formatFollowerLabel(count),
    followerCount: count,
    verified: s.verified ?? false,
    score,
    isFollowing: s.isFollowing ?? false,
    notifyEnabled: false,
    domain: s.domain ?? "其他",
  };
}

// Map a "my sources" row (from /api/sources/my) to DiscoverSource
function mapMySource(row: any): DiscoverSource {
  const src = row.source ?? {};
  const count: number = src.x_followers_count ?? 0;
  const handle: string = src.x_handle ?? "";

  const score: DiscoverScore = {
    influence: src.score_influence ?? Math.min(100, Math.round((Math.log10(Math.max(count, 1)) / 8) * 100)),
    relevance: src.score_relevance ?? 72,
    activity: src.score_activity ?? 68,
  };

  return {
    id: src.id ?? `src-${handle}`,
    type: src.type ?? "person",
    nameEn: src.name_en ?? handle,
    nameZh: src.name_zh ?? src.name_en ?? handle,
    company: src.company ?? "",
    title: src.title ?? "",
    avatarTint: src.avatar_tint ?? handleToTint(handle),
    avatarText: (src.name_en ?? handle).slice(0, 1).toUpperCase(),
    handle: `@${handle}`,
    bio: "",
    followerLabel: formatFollowerLabel(count),
    followerCount: count,
    verified: src.x_verified ?? false,
    score,
    isFollowing: true,
    notifyEnabled: row.notify ?? false,
    domain: src.domain ?? "其他",
  };
}

export default function DiscoverView() {
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [viewState, setViewState] = useState<ViewState>("idle");
  const [resultTab, setResultTab] = useState<ResultTab>("persons");
  const [persons, setPersons] = useState<DiscoverSource[]>([]);
  const [orgs, setOrgs] = useState<DiscoverSource[]>([]);
  const [mySources, setMySources] = useState<DiscoverSource[]>([]);
  const [myLoading, setMyLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // 识别当前输入类型（即时显示）
  const detection = useMemo(() => {
    if (!query.trim()) return null;
    return detectInputType(query);
  }, [query]);

  // 加载我的追踪列表
  const loadMySources = useCallback(async () => {
    setMyLoading(true);
    try {
      const res = await fetch("/api/sources/my");
      if (res.ok) {
        const json = await res.json();
        setMySources((json.sources ?? []).map(mapMySource));
      }
    } finally {
      setMyLoading(false);
    }
  }, []);

  useEffect(() => { loadMySources(); }, [loadMySources]);

  async function handleSearch() {
    const q = query.trim();
    if (!q) return;
    setSubmitted(q);
    setViewState("scanning");
    setPersons([]);
    setOrgs([]);

    try {
      const det = detectInputType(q);
      const type = det.type === "domain" ? "domain" : "name";
      const res = await fetch(
        `/api/discover/search?q=${encodeURIComponent(q)}&type=${type}`
      );
      if (!res.ok) throw new Error("search failed");
      const data = await res.json();

      if (type === "domain") {
        setPersons((data.persons ?? []).map(mapApiSource));
        setOrgs((data.orgs ?? []).map(mapApiSource));
        setResultTab("persons");
        setViewState("domain");
      } else {
        setPersons((data.persons ?? []).map(mapApiSource));
        setViewState("name");
      }
    } catch {
      setViewState("error");
    }
  }

  function handleClear() {
    setQuery("");
    setSubmitted("");
    setViewState("idle");
    setPersons([]);
    setOrgs([]);
    inputRef.current?.focus();
  }

  async function handleDomainChip(label: string) {
    setQuery(label);
    setSubmitted(label);
    setViewState("scanning");
    setPersons([]);
    setOrgs([]);

    try {
      const res = await fetch(
        `/api/discover/search?q=${encodeURIComponent(label)}&type=domain`
      );
      if (!res.ok) throw new Error("search failed");
      const data = await res.json();
      setPersons((data.persons ?? []).map(mapApiSource));
      setOrgs((data.orgs ?? []).map(mapApiSource));
      setResultTab("persons");
      setViewState("domain");
    } catch {
      setViewState("error");
    }
  }

  function handleFollowToggle(handle: string, following: boolean) {
    if (following) {
      loadMySources();
    } else {
      setMySources((prev) => prev.filter((s) => s.handle !== `@${handle}` && s.handle !== handle));
    }
    router.refresh();
  }

  function handleUnfollow(handle: string) {
    setMySources((prev) => prev.filter((s) => s.handle !== `@${handle}` && s.handle !== handle));
    // 清 Next.js Router Cache，确保信号流切回来时拿到最新数据
    router.refresh();
  }

  const showResults = viewState === "domain" || viewState === "name";
  const isScanning = viewState === "scanning";

  return (
    <div className="mx-auto max-w-app pb-28">
      {/* ── 搜索区域 ── */}
      <div className="sticky top-14 z-10 bg-page px-page pb-3 pt-3">
        <div
          className="flex items-center gap-2 rounded-xl border bg-surface px-3 shadow-card transition-all"
          style={{
            borderColor: query ? "var(--color-brand)" : "var(--color-border)",
            boxShadow: query ? "0 0 0 3px var(--color-brand-weak)" : undefined,
          }}
        >
          {isScanning ? (
            <div className="relative flex h-5 w-5 shrink-0 items-center justify-center">
              <span
                className="animate-radar-ping absolute inset-0 rounded-full"
                style={{ background: "var(--color-brand-weak-strong)" }}
              />
              <IconRadar2 size={18} stroke={1.8} className="relative text-brand" />
            </div>
          ) : (
            <IconSearch size={18} stroke={1.8} className="shrink-0 text-content-tertiary" />
          )}

          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="搜索领域或名字，如：AI、马斯克、OpenAI"
            className="flex-1 bg-transparent py-3 text-[14px] text-content-primary placeholder:text-content-tertiary focus:outline-none"
          />

          {query && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="清除"
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-2 text-content-tertiary"
            >
              <IconX size={13} stroke={2.5} />
            </button>
          )}
        </div>

        {/* 识别标签 */}
        {query && detection && !isScanning && (
          <div className="animate-fade-in mt-2 flex items-center gap-2 px-1">
            <span
              className="rounded-pill px-2 py-0.5 text-tiny font-medium"
              style={{
                background:
                  detection.type === "domain"
                    ? "var(--color-background-info)"
                    : "var(--color-background-warning)",
                color:
                  detection.type === "domain"
                    ? "var(--color-text-info)"
                    : "var(--color-text-warning)",
              }}
            >
              {detection.type === "domain" ? "识别为领域" : "识别为名字"}
            </span>
            <span className="text-tiny text-content-tertiary">
              {detection.type === "domain"
                ? `将推荐「${detection.normalizedDomain ?? query}」领域的名人和官方账号`
                : "将直接匹配对应账号"}
            </span>
            {detection.type === "name" && (
              <button
                type="button"
                onClick={() => handleDomainChip(query)}
                className="ml-auto shrink-0 text-tiny text-brand underline-offset-2 hover:underline"
              >
                按领域搜？
              </button>
            )}
          </div>
        )}

        {isScanning && (
          <div className="animate-fade-in mt-2 flex items-center gap-2 px-1">
            <IconLoader2 size={13} stroke={2} className="animate-spin text-brand" />
            <span className="text-tiny text-brand">正在扫描「{submitted}」…</span>
          </div>
        )}
      </div>

      <div className="px-page">
        {/* 空闲状态 */}
        {viewState === "idle" && (
          <div className="animate-fade-up space-y-5">
            <div>
              <p className="mb-3 text-tiny font-semibold uppercase tracking-wider text-content-tertiary">
                快速探索领域
              </p>
              <div className="flex flex-wrap gap-2">
                {quickDomains.map((d) => (
                  <button
                    key={d.key}
                    type="button"
                    onClick={() => handleDomainChip(d.label)}
                    className="flex items-center gap-1.5 rounded-pill border border-line bg-surface px-4 py-2 text-[13px] font-medium text-content-primary shadow-card transition-colors active:bg-surface-2"
                  >
                    <span>{d.emoji}</span>
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
            <MyFollowingSection
              sources={mySources}
              loading={myLoading}
              onNotifyToggle={() => {}}
              onUnfollow={handleUnfollow}
            />
          </div>
        )}

        {/* 领域结果 */}
        {viewState === "domain" && (
          <div className="animate-fade-in space-y-3">
            <p className="text-tiny text-content-tertiary">
              <span className="font-medium text-content-primary">「{submitted}」</span>
              {" "}领域推荐 · 按影响力 / 相关性 / 活跃度排序
            </p>

            <div className="flex gap-1 rounded-xl bg-surface-2 p-1">
              <TabBtn
                active={resultTab === "persons"}
                label="名人"
                icon={<IconUsersGroup size={14} stroke={1.9} />}
                count={persons.length}
                onClick={() => setResultTab("persons")}
              />
              <TabBtn
                active={resultTab === "orgs"}
                label="官方账号"
                icon={<IconBuildingCommunity size={14} stroke={1.9} />}
                count={orgs.length}
                onClick={() => setResultTab("orgs")}
              />
            </div>

            <div className="space-y-cardgap">
              {(resultTab === "persons" ? persons : orgs).map((s, i) => (
                <SourceResultCard
                  key={s.id}
                  source={s}
                  index={i}
                  onFollowToggle={handleFollowToggle}
                />
              ))}
              {(resultTab === "persons" ? persons : orgs).length === 0 && (
                <p className="py-10 text-center text-meta text-content-tertiary">暂无结果</p>
              )}
            </div>
          </div>
        )}

        {/* 名字搜索结果 */}
        {viewState === "name" && (
          <div className="animate-fade-in space-y-3">
            <p className="text-tiny text-content-tertiary">
              找到{" "}
              <span className="font-medium text-content-primary">{persons.length}</span>{" "}
              个与「{submitted}」相关的账号
            </p>

            {persons.length > 0 ? (
              <div className="space-y-cardgap">
                {persons.map((s, i) => (
                  <SourceResultCard
                    key={s.id}
                    source={s}
                    index={i}
                    onFollowToggle={handleFollowToggle}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 py-16 text-content-tertiary">
                <IconSearch size={36} stroke={1.2} className="opacity-30" />
                <p className="text-meta">没有找到相关账号</p>
                <button
                  type="button"
                  onClick={() => handleDomainChip(submitted)}
                  className="rounded-pill bg-brand-weak px-4 py-2 text-meta font-medium text-brand"
                >
                  改为按「{submitted}」领域搜索
                </button>
              </div>
            )}
          </div>
        )}

        {/* 搜索出错 */}
        {viewState === "error" && (
          <div className="flex flex-col items-center gap-3 py-16 text-content-tertiary">
            <p className="text-meta">搜索失败，请稍后重试</p>
            <button
              type="button"
              onClick={handleClear}
              className="rounded-pill bg-surface px-4 py-2 text-meta text-brand shadow-card"
            >
              重新搜索
            </button>
          </div>
        )}

        {showResults && (
          <div className="mt-8">
            <MyFollowingSection
              sources={mySources}
              loading={myLoading}
              onNotifyToggle={() => {}}
              onUnfollow={handleUnfollow}
            />
          </div>
        )}
      </div>
    </div>
  );
}

/* ── 子组件 ──────────────────────────────────────────────────── */

function TabBtn({
  active,
  label,
  icon,
  count,
  onClick,
}: {
  active: boolean;
  label: string;
  icon: React.ReactNode;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-meta font-medium transition-all ${
        active
          ? "bg-surface text-content-primary shadow-card"
          : "text-content-tertiary"
      }`}
    >
      {icon}
      {label}
      <span
        className={`rounded-pill px-1.5 text-tiny ${
          active ? "bg-brand-weak text-brand" : "bg-surface text-content-tertiary"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

function MyFollowingSection({
  sources,
  loading,
  onNotifyToggle,
  onUnfollow,
}: {
  sources: DiscoverSource[];
  loading: boolean;
  onNotifyToggle: (handle: string, notify: boolean) => void;
  onUnfollow: (handle: string) => void;
}) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2">
        <span className="text-brand">
          <IconSparkles size={14} stroke={1.9} />
        </span>
        <h2 className="text-[14px] font-semibold text-content-primary">我的追踪</h2>
        {!loading && (
          <span className="ml-auto rounded-pill bg-brand-weak px-2 py-0.5 text-tiny font-medium text-brand">
            {sources.length}
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <IconLoader2 size={20} stroke={2} className="animate-spin text-content-tertiary" />
        </div>
      ) : sources.length > 0 ? (
        <div className="rounded-xl bg-surface px-card shadow-card">
          {sources.map((s) => (
            <MySourceRow
              key={s.id}
              source={s}
              onNotifyToggle={onNotifyToggle}
              onUnfollow={onUnfollow}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 rounded-xl bg-surface py-10 text-center shadow-card">
          <IconUsersGroup size={32} stroke={1.2} className="text-content-tertiary opacity-40" />
          <p className="text-meta text-content-tertiary">还没有追踪任何信源</p>
          <p className="text-tiny text-content-tertiary">搜索领域或名字，添加你的第一个信源</p>
        </div>
      )}
    </div>
  );
}
