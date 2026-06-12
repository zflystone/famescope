"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  IconArrowLeft, IconUsers, IconDatabase, IconRss,
  IconLink, IconFileText, IconLoader2, IconShieldCheck,
} from "@tabler/icons-react";

type Stats = {
  users: number;
  sources: number;
  posts: number;
  userSources: number;
  todayPosts: number;
};

function StatCard({ icon, label, value, sub }: {
  icon: React.ReactNode; label: string; value: number | string; sub?: string;
}) {
  return (
    <div
      className="rounded-xl p-4"
      style={{ background: "var(--color-bg-surface)" }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span style={{ color: "var(--color-brand)" }}>{icon}</span>
        <span className="text-[11px] font-medium uppercase tracking-wider"
          style={{ color: "var(--color-text-tertiary)" }}>{label}</span>
      </div>
      <p className="text-[28px] font-semibold" style={{ color: "var(--color-text-primary)", letterSpacing: "-0.02em" }}>
        {value}
      </p>
      {sub && <p className="mt-0.5 text-[11px]" style={{ color: "var(--color-text-tertiary)" }}>{sub}</p>}
    </div>
  );
}

function Toggle({ checked, onChange, loading }: { checked: boolean; onChange: (v: boolean) => void; loading: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={loading}
      onClick={() => onChange(!checked)}
      style={{
        width: "46px", height: "27px", borderRadius: "999px",
        background: checked ? "var(--color-brand)" : "var(--color-border-strong)",
        position: "relative", flexShrink: 0,
        transition: "background 0.22s ease", border: "none",
        cursor: loading ? "not-allowed" : "pointer", padding: 0,
        opacity: loading ? 0.6 : 1,
      }}
    >
      <span style={{
        position: "absolute", top: "3px",
        left: checked ? "22px" : "3px",
        width: "21px", height: "21px", borderRadius: "50%",
        background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
        transition: "left 0.22s cubic-bezier(.4,0,.2,1)",
      }} />
    </button>
  );
}

export default function AdminView() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [regEnabled, setRegEnabled] = useState(true);
  const [regLoading, setRegLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) => setStats(d))
      .catch(() => {})
      .finally(() => setStatsLoading(false));

    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => setRegEnabled(d.registrationEnabled ?? true))
      .catch(() => {})
      .finally(() => setRegLoading(false));
  }, []);

  async function handleToggleReg(val: boolean) {
    setSaving(true);
    try {
      await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationEnabled: val }),
      });
      setRegEnabled(val);
    } catch {}
    setSaving(false);
  }

  return (
    <div className="min-h-dvh" style={{ background: "var(--color-bg-page)" }}>
      {/* 顶部导航 */}
      <header
        className="sticky top-0 z-20 border-b"
        style={{ background: "var(--color-bg-page)", borderColor: "var(--color-border)" }}
      >
        <div className="mx-auto flex h-14 max-w-app items-center gap-3 px-page">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-9 w-9 items-center justify-center rounded-md transition-colors active:opacity-60"
            style={{ color: "var(--color-text-secondary)" }}
          >
            <IconArrowLeft size={20} stroke={1.8} />
          </button>
          <div className="flex items-center gap-2">
            <span
              className="flex h-6 w-6 items-center justify-center rounded-md"
              style={{ background: "var(--color-brand-weak)", color: "var(--color-brand)" }}
            >
              <IconShieldCheck size={14} stroke={2} />
            </span>
            <span className="text-[17px] font-semibold"
              style={{ color: "var(--color-text-primary)", letterSpacing: "-0.01em" }}>
              管理面板
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-app px-page pb-16 pt-6 space-y-6">

        {/* 访客统计 */}
        <section>
          <p className="mb-3 px-1 text-[11px] font-semibold uppercase tracking-wider"
            style={{ color: "var(--color-text-tertiary)" }}>
            访客统计
          </p>
          {statsLoading ? (
            <div className="flex justify-center py-8">
              <IconLoader2 size={22} stroke={1.8} className="animate-spin"
                style={{ color: "var(--color-text-tertiary)" }} />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                icon={<IconUsers size={16} stroke={2} />}
                label="注册用户"
                value={stats?.users ?? 0}
                sub="有追踪记录的账号"
              />
              <StatCard
                icon={<IconRss size={16} stroke={2} />}
                label="信源总数"
                value={stats?.sources ?? 0}
                sub="已入库信源"
              />
              <StatCard
                icon={<IconDatabase size={16} stroke={2} />}
                label="内容总数"
                value={stats?.posts ?? 0}
                sub={`今日新增 ${stats?.todayPosts ?? 0} 条`}
              />
              <StatCard
                icon={<IconLink size={16} stroke={2} />}
                label="追踪关系"
                value={stats?.userSources ?? 0}
                sub="用户×信源订阅数"
              />
            </div>
          )}
        </section>

        {/* 系统设置 */}
        <section>
          <p className="mb-3 px-1 text-[11px] font-semibold uppercase tracking-wider"
            style={{ color: "var(--color-text-tertiary)" }}>
            系统设置
          </p>
          <div
            className="overflow-hidden rounded-xl px-4"
            style={{ background: "var(--color-bg-surface)" }}
          >
            <div className="flex items-center gap-3 py-4">
              <span style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                width: "28px", height: "28px", borderRadius: "8px", flexShrink: 0,
                background: "var(--color-brand-weak)", color: "var(--color-brand)",
              }}>
                <IconFileText size={15} stroke={2} />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium" style={{ color: "var(--color-text-primary)" }}>
                  开放注册
                </p>
                <p className="mt-0.5 text-[11px]" style={{ color: "var(--color-text-tertiary)" }}>
                  {regEnabled ? "新用户可以注册账号" : "已关闭，仅限现有用户登录"}
                </p>
              </div>
              {regLoading ? (
                <IconLoader2 size={18} stroke={1.8} className="animate-spin"
                  style={{ color: "var(--color-text-tertiary)" }} />
              ) : (
                <Toggle checked={regEnabled} onChange={handleToggleReg} loading={saving} />
              )}
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
