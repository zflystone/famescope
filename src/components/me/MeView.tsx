"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  IconChevronRight,
  IconBell,
  IconClock,
  IconSun,
  IconMoon,
  IconLogout,
  IconMessageCircle,
  IconShieldCheck,
  IconFileText,
  IconUsersGroup,
  IconInfoCircle,
  IconLoader2,
  IconLayoutDashboard,
} from "@tabler/icons-react";
import { useTheme } from "@/components/theme/ThemeToggle";
import { createClient } from "@/lib/supabase/client";

/* ── Toggle 开关 ────────────────────────────────────────────── */
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      style={{
        width: "46px", height: "27px", borderRadius: "999px",
        background: checked ? "var(--color-brand)" : "var(--color-border-strong)",
        position: "relative", flexShrink: 0,
        transition: "background 0.22s ease", border: "none", cursor: "pointer", padding: 0,
      }}
    >
      <span
        style={{
          position: "absolute", top: "3px",
          left: checked ? "22px" : "3px",
          width: "21px", height: "21px", borderRadius: "50%",
          background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
          transition: "left 0.22s cubic-bezier(.4,0,.2,1)",
        }}
      />
    </button>
  );
}

/* ── 深/浅模式分段控件 ───────────────────────────────────────── */
function ThemeSegmented({ dark, onToggle }: { dark: boolean; onToggle: () => void }) {
  return (
    <div style={{ display: "flex", borderRadius: "10px", background: "var(--color-bg-surface-2)", padding: "3px", gap: "2px" }}>
      {(
        [
          { key: false, label: "浅色", icon: <IconSun size={13} stroke={2} /> },
          { key: true,  label: "深色", icon: <IconMoon size={13} stroke={2} /> },
        ] as const
      ).map(({ key, label, icon }) => (
        <button
          key={String(key)}
          type="button"
          onClick={() => { if (dark !== key) onToggle(); }}
          style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "4px",
            padding: "5px 10px", borderRadius: "7px", fontSize: "12px", fontWeight: 500,
            cursor: "pointer", border: "none", transition: "all 0.18s ease",
            background: dark === key ? "var(--color-bg-surface)" : "transparent",
            color: dark === key ? "var(--color-text-primary)" : "var(--color-text-tertiary)",
            boxShadow: dark === key ? "var(--shadow-card)" : "none",
          }}
        >
          {icon}{label}
        </button>
      ))}
    </div>
  );
}

/* ── 通用行 ─────────────────────────────────────────────────── */
function Row({
  icon, label, right, onClick, danger = false,
}: {
  icon: React.ReactNode; label: string; right?: React.ReactNode;
  onClick?: () => void; danger?: boolean;
}) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      {...(onClick ? { type: "button" as const, onClick } : {})}
      className="flex w-full items-center gap-3 border-b border-line-divider py-3.5 last:border-b-0 active:bg-surface-hover"
      style={{ background: "transparent", cursor: onClick ? "pointer" : "default" }}
    >
      <span style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        width: "28px", height: "28px", borderRadius: "8px", flexShrink: 0,
        background: danger ? "rgba(220,38,38,0.1)" : "var(--color-brand-weak)",
        color: danger ? "rgb(220,38,38)" : "var(--color-brand)",
      }}>
        {icon}
      </span>
      <span className="flex-1 text-left text-[13px] font-medium"
        style={{ color: danger ? "rgb(220,38,38)" : "var(--color-text-primary)" }}>
        {label}
      </span>
      {right}
    </Tag>
  );
}

/* ── Section 容器 ────────────────────────────────────────────── */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <p className="mb-2 px-1 text-tiny font-semibold uppercase tracking-wider"
        style={{ color: "var(--color-text-tertiary)" }}>
        {title}
      </p>
      <div className="overflow-hidden rounded-xl px-card shadow-card"
        style={{ background: "var(--color-bg-surface)" }}>
        {children}
      </div>
    </section>
  );
}

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const arr = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) arr[i] = rawData.charCodeAt(i);
  return arr.buffer;
}

/* ── 主视图 ──────────────────────────────────────────────────── */
export default function MeView() {
  const { dark, mounted, toggle } = useTheme();
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [avatarText, setAvatarText] = useState("?");
  const [sourceCount, setSourceCount] = useState<number | null>(null);
  const [digestEnabled, setDigestEnabled] = useState(false);
  const [digestTime, setDigestTime] = useState("08:00");
  const [signingOut, setSigningOut] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      const e = user.email ?? "";
      setEmail(e);
      setAvatarText(e.slice(0, 1).toUpperCase());
    });

    fetch("/api/sources/my")
      .then((r) => r.json())
      .then((d) => setSourceCount((d.sources ?? []).length))
      .catch(() => {});

    fetch("/api/admin/is-admin")
      .then((r) => r.json())
      .then((d) => setIsAdmin(d.isAdmin ?? false))
      .catch(() => {});

    // 检查当前推送订阅状态
    if ("serviceWorker" in navigator && "PushManager" in window) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.pushManager.getSubscription().then((sub) => {
          setDigestEnabled(!!sub);
        });
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleTogglePush(val: boolean) {
    if (pushLoading) return;
    setPushLoading(true);
    try {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        alert("您的浏览器不支持推送通知");
        return;
      }
      const reg = await navigator.serviceWorker.ready;

      if (val) {
        // 请求权限
        const perm = await Notification.requestPermission();
        if (perm !== "granted") {
          alert("请在浏览器设置中允许通知权限");
          return;
        }
        // 订阅
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(
            process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
          ),
        });
        await fetch("/api/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(sub),
        });
        setDigestEnabled(true);
      } else {
        // 取消订阅
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
          await fetch("/api/push/subscribe", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ endpoint: sub.endpoint }),
          });
          await sub.unsubscribe();
        }
        setDigestEnabled(false);
      }
    } catch (err) {
      console.error("push toggle error", err);
    } finally {
      setPushLoading(false);
    }
  }

  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div className="mx-auto max-w-app">
      {/* 顶部装饰区 */}
      <div
        className="relative overflow-hidden pb-5 pt-10"
        style={{ background: "linear-gradient(160deg, var(--color-brand-weak-strong) 0%, var(--color-bg-page) 65%)" }}
      >
        <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full"
          style={{ background: "var(--color-brand-weak)" }} />
        <div className="relative px-page flex items-end gap-4">
          {/* 头像 */}
          <div
            className="flex h-[68px] w-[68px] items-center justify-center rounded-full shadow-elevated"
            style={{
              background: "linear-gradient(135deg, var(--color-brand), var(--color-brand-strong))",
              fontSize: "26px", fontWeight: 700, color: "#fff", letterSpacing: "-0.01em", flexShrink: 0,
            }}
          >
            {avatarText}
          </div>
          {/* 用户信息 */}
          <div className="pb-1 min-w-0">
            <p className="text-[18px] font-semibold truncate" style={{ color: "var(--color-text-primary)" }}>
              {email || <span className="inline-block h-5 w-36 rounded-md animate-pulse" style={{ background: "var(--color-border)" }} />}
            </p>
            {sourceCount !== null && (
              <p className="mt-0.5 text-meta" style={{ color: "var(--color-text-tertiary)" }}>
                追踪 {sourceCount} 个信源
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 内容区 */}
      <div className="animate-fade-up space-y-6 px-page pt-5 pb-28">

        {/* 账号 */}
        <Section title="账号">
          <Row
            icon={<IconUsersGroup size={15} stroke={2} />}
            label="管理我的追踪"
            right={
              <span className="flex items-center gap-1 text-tiny text-content-tertiary">
                {sourceCount !== null && (
                  <span className="rounded-pill bg-brand-weak px-2 py-0.5 text-tiny font-medium text-brand">
                    {sourceCount}
                  </span>
                )}
                <IconChevronRight size={15} stroke={1.8} />
              </span>
            }
            onClick={() => router.push("/discover")}
          />
          <Row
            icon={signingOut
              ? <IconLoader2 size={15} stroke={2} className="animate-spin" />
              : <IconLogout size={15} stroke={2} />
            }
            label={signingOut ? "正在退出…" : "退出登录"}
            onClick={handleSignOut}
            danger
          />
        </Section>

        {/* 通知设置 */}
        <Section title="通知设置">
          <Row
            icon={pushLoading
              ? <IconLoader2 size={15} stroke={2} className="animate-spin" />
              : <IconBell size={15} stroke={2} />
            }
            label="每日简报推送"
            right={
              <div className="flex flex-col items-end gap-0.5">
                <Toggle checked={digestEnabled} onChange={handleTogglePush} />
                <span className="text-tiny" style={{ color: "var(--color-text-tertiary)" }}>
                  {digestEnabled ? "每天早 8 点推送" : "点击开启通知"}
                </span>
              </div>
            }
          />
          <Row
            icon={<IconClock size={15} stroke={2} />}
            label="推送时间"
            right={
              <label className="flex items-center gap-1" style={{ cursor: "pointer" }}>
                <input
                  type="time"
                  value={digestTime}
                  onChange={(e) => setDigestTime(e.target.value)}
                  disabled={!digestEnabled}
                  style={{
                    background: "transparent", border: "none",
                    fontSize: "13px", fontWeight: 500,
                    color: digestEnabled ? "var(--color-brand)" : "var(--color-text-tertiary)",
                    outline: "none",
                    cursor: digestEnabled ? "pointer" : "default",
                    opacity: digestEnabled ? 1 : 0.4,
                  }}
                />
              </label>
            }
          />
        </Section>

        {/* 显示偏好 */}
        <Section title="显示偏好">
          <Row
            icon={mounted && dark ? <IconMoon size={15} stroke={2} /> : <IconSun size={15} stroke={2} />}
            label="外观模式"
            right={
              mounted
                ? <ThemeSegmented dark={dark} onToggle={toggle} />
                : <span className="w-[108px] h-[33px] rounded-[10px]" style={{ background: "var(--color-bg-surface-2)" }} />
            }
          />
        </Section>

        {/* 管理员（仅管理员可见） */}
        {isAdmin && (
          <Section title="管理员">
            <Row
              icon={<IconLayoutDashboard size={15} stroke={2} />}
              label="管理面板"
              right={<IconChevronRight size={15} stroke={1.8} style={{ color: "var(--color-text-tertiary)" }} />}
              onClick={() => { window.location.href = "/admin"; }}
            />
          </Section>
        )}

        {/* 关于 */}
        <Section title="关于">
          <Row
            icon={<IconInfoCircle size={15} stroke={2} />}
            label="版本"
            right={<span className="text-meta" style={{ color: "var(--color-text-tertiary)" }}>v0.1.0</span>}
          />
          <Row
            icon={<IconMessageCircle size={15} stroke={2} />}
            label="意见反馈"
            right={<IconChevronRight size={15} stroke={1.8} style={{ color: "var(--color-text-tertiary)" }} />}
            onClick={() => {}}
          />
          <Row
            icon={<IconShieldCheck size={15} stroke={2} />}
            label="隐私政策"
            right={<IconChevronRight size={15} stroke={1.8} style={{ color: "var(--color-text-tertiary)" }} />}
            onClick={() => { window.location.href = "/privacy"; }}
          />
          <Row
            icon={<IconFileText size={15} stroke={2} />}
            label="用户协议"
            right={<IconChevronRight size={15} stroke={1.8} style={{ color: "var(--color-text-tertiary)" }} />}
            onClick={() => { window.location.href = "/terms"; }}
          />
        </Section>
      </div>
    </div>
  );
}
