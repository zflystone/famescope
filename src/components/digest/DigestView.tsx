"use client";

import { useState, useEffect } from "react";
import {
  IconBulb,
  IconSparkles,
  IconWaveSine,
  IconBuildingBank,
  IconUsersGroup,
  IconLoader2,
} from "@tabler/icons-react";
import type { DigestEntry } from "@/lib/fixtures/digest";
import type { DigestContent } from "@/types/database";
import DigestMasthead from "./DigestMasthead";
import DigestStats from "./DigestStats";
import SectionHeader from "./SectionHeader";
import HighlightCard from "./HighlightCard";
import ResonanceCard from "./ResonanceCard";
import OfficialNewsRow from "./OfficialNewsRow";
import SourceActivityRow from "./SourceActivityRow";
import DigestHistoryItem from "./DigestHistoryItem";
import { handleToTint } from "@/lib/fixtures/discover";

// ─── DB row → DigestEntry ────────────────────────────────────────
function mapDbDigest(row: { id: string; generated_at: string; content: DigestContent }): DigestEntry {
  const c = row.content;
  const d = new Date(row.generated_at);
  const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
  const dateDisplay = `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 · 周${weekdays[d.getDay()]}`;

  const highlights = (c.highlights ?? []).map((h, i) => ({
    id: h.postId ?? String(i),
    source: {
      id: h.sourceId ?? "",
      type: "person" as const,
      nameZh: h.sourceNameZh ?? h.sourceNameEn ?? "",
      nameEn: h.sourceNameEn ?? "",
      avatarTint: handleToTint(h.sourceNameEn ?? h.sourceId ?? ""),
      avatarText: (h.sourceNameEn ?? "?").slice(0, 1).toUpperCase(),
      company: "",
      title: "",
      domain: "other" as const,
    },
    signalHint: h.signalHint ?? "",
    summaryZh: h.summaryZh ?? "",
    tags: h.tags ?? [],
    score: h.score ?? 6,
  }));

  const resonance = (c.resonance ?? []).map((r) => ({
    topic: r.topic ?? "",
    description: r.description ?? "",
    sources: [],
    tags: [],
  }));

  const officialNews = (c.officialNews ?? []).map((n) => ({
    source: {
      id: n.sourceId ?? "",
      type: "org" as const,
      nameZh: n.title ?? "",
      nameEn: n.title ?? "",
      avatarTint: "#6E59E0",
      avatarText: "O",
      company: "",
      title: "官方",
      domain: "other" as const,
    },
    title: n.title ?? "",
    summaryZh: n.summaryZh ?? "",
    readUrl: n.articleUrl ?? "",
  }));

  const sourceActivity = (c.sourceActivity ?? []).map((a) => ({
    source: {
      id: a.sourceId ?? "",
      type: "person" as const,
      nameZh: a.sourceNameZh ?? a.sourceNameEn ?? "",
      nameEn: a.sourceNameEn ?? "",
      avatarTint: handleToTint(a.sourceNameEn ?? a.sourceId ?? ""),
      avatarText: (a.sourceNameEn ?? "?").slice(0, 1).toUpperCase(),
      company: "",
      title: "",
      domain: "other" as const,
    },
    count: a.count ?? 0,
    topSummary: a.topSummary ?? "",
  }));

  return {
    id: row.id,
    date: dateDisplay,
    dateIso: row.generated_at.slice(0, 10),
    coreConclusion: c.coreConclusion ?? "",
    stats: [
      { label: "追踪信源", value: String(sourceActivity.length) },
      { label: "今日动态", value: String(highlights.length) },
      { label: "高分条目", value: String(highlights.filter((h) => h.score >= 7).length) },
      { label: "官方公告", value: String(officialNews.length) },
    ],
    highlights,
    resonance,
    officialNews,
    sourceActivity,
  };
}

// 模块级缓存，切 tab 再切回来不重新请求
let digestCache: DigestEntry[] | null = null;
let digestCacheTs = 0;
const DIGEST_CACHE_TTL = 5 * 60 * 1000; // 5 分钟

export default function DigestView() {
  const [digests, setDigests] = useState<DigestEntry[]>(() => digestCache ?? []);
  const [loading, setLoading] = useState(digestCache === null);
  useEffect(() => {
    if (digestCache && Date.now() - digestCacheTs < DIGEST_CACHE_TTL) return;
    setLoading(true);
    fetch("/api/digest/list")
      .then((r) => r.json())
      .then((data) => {
        const rows = (data.digests ?? []).map(mapDbDigest);
        digestCache = rows;
        digestCacheTs = Date.now();
        setDigests(rows);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <IconLoader2 size={24} stroke={2} className="animate-spin text-content-tertiary" />
      </div>
    );
  }

  // 没有简报时显示空状态
  if (digests.length === 0) {
    return (
      <div className="mx-auto max-w-app px-page pb-28">
        <div className="flex flex-col items-center justify-center gap-4 py-32 text-center">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-2xl text-2xl"
            style={{ background: "var(--color-brand-weak)", color: "var(--color-brand)" }}
          >
            📋
          </div>
          <div>
            <p className="text-[16px] font-semibold" style={{ color: "var(--color-text-primary)" }}>
              今日简报还未生成
            </p>
            <p className="mt-1 text-[13px]" style={{ color: "var(--color-text-tertiary)" }}>
              每天早 8 点自动生成
            </p>
            <p className="mt-0.5 text-[13px]" style={{ color: "var(--color-text-tertiary)" }}>
              先去发现页添加你关注的信源吧
            </p>
          </div>
        </div>
      </div>
    );
  }

  const d = digests[0];
  const history = digests.slice(1);

  return (
    <div className="mx-auto max-w-app space-y-5 px-page py-4 pb-28">

      {/* 封面头 */}
      <DigestMasthead date={d.date} issue={`第 ${digests.length} 期`} />

      {/* 今日数字 */}
      <DigestStats stats={d.stats} />

      {/* 今日核心 */}
      <section
        className="rounded-xl p-4"
        style={{ background: "var(--color-bg-surface-2)" }}
      >
        <div className="mb-2 flex items-center gap-1.5 text-tiny font-semibold uppercase tracking-wider text-brand">
          <IconBulb size={13} stroke={2} />
          今日核心
        </div>
        <p
          className="font-serif text-[15px] font-medium leading-relaxed text-content-primary"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {d.coreConclusion}
        </p>
      </section>

      {/* 最值得关注 */}
      <section className="space-y-3">
        <SectionHeader
          icon={<IconSparkles size={15} stroke={1.9} />}
          title="最值得关注"
          sub={`今日高分动态 Top ${d.highlights.length}`}
        />
        <div className="space-y-2.5">
          {d.highlights.map((h, i) => (
            <HighlightCard key={h.id} item={h} rank={i + 1} />
          ))}
        </div>
      </section>

      {/* 信号共振 */}
      {d.resonance.length > 0 && (
        <section className="space-y-3">
          <SectionHeader
            icon={<IconWaveSine size={15} stroke={1.9} />}
            title="信号共振"
            sub="多人同时提到同一话题"
          />
          <div className="space-y-2.5">
            {d.resonance.map((r) => (
              <ResonanceCard key={r.topic} item={r} />
            ))}
          </div>
        </section>
      )}

      {/* 官方新闻 */}
      {d.officialNews.length > 0 && (
        <section className="space-y-3">
          <SectionHeader
            icon={<IconBuildingBank size={15} stroke={1.9} />}
            title="官方新闻"
            sub={`${d.officialNews.length} 条官方公告`}
          />
          <div className="rounded-xl bg-surface px-card shadow-card">
            {d.officialNews.map((n) => (
              <OfficialNewsRow key={n.title} item={n} />
            ))}
          </div>
        </section>
      )}

      {/* 你关注的人 */}
      {d.sourceActivity.length > 0 && (
        <section className="space-y-3">
          <SectionHeader
            icon={<IconUsersGroup size={15} stroke={1.9} />}
            title="你关注的人"
            sub="今日动态概览"
          />
          <div className="rounded-xl bg-surface px-card shadow-card">
            {d.sourceActivity.map((a) => (
              <SourceActivityRow key={a.source.id} item={a} />
            ))}
          </div>
        </section>
      )}

      {/* 历史简报 */}
      {history.length > 0 && (
        <section className="space-y-3">
          <SectionHeader
            icon={<IconBulb size={15} stroke={1.9} />}
            title="历史简报"
            sub="点击展开回看"
          />
          <div className="space-y-2.5">
            {history.map((entry) => (
              <DigestHistoryItem key={entry.id} entry={entry} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
