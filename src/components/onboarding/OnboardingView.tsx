"use client";

import { useRouter } from "next/navigation";
import {
  IconSearch,
  IconSparkles,
  IconCalendarStats,
  IconArrowRight,
  IconChevronRight,
} from "@tabler/icons-react";

const STEPS = [
  {
    icon: <IconSearch size={17} stroke={1.9} />,
    num: "01",
    title: "添加信源",
    desc: "搜索你关注的领域或人物，一键订阅",
  },
  {
    icon: <IconSparkles size={17} stroke={1.9} />,
    num: "02",
    title: "AI 提炼信号",
    desc: "自动翻译推文，过滤噪音，只留有价值的观点",
  },
  {
    icon: <IconCalendarStats size={17} stroke={1.9} />,
    num: "03",
    title: "每日简报",
    desc: "每天早8点推送，5分钟读完领域昨日动态",
  },
];

/* ── 雷达可视化 ───────────────────────────────────────────────── */
function RadarVisual() {
  const rings = [220, 168, 118, 74];
  return (
    <div
      className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
      aria-hidden
    >
      {/* 静态同心环 */}
      {rings.map((size, i) => (
        <div
          key={size}
          className="absolute rounded-full border"
          style={{
            width: size,
            height: size,
            borderColor: "var(--color-brand)",
            opacity: 0.06 + i * 0.04,
          }}
        />
      ))}

      {/* 旋转扫描扇形 */}
      <div
        className="absolute rounded-full animate-radar-sweep"
        style={{
          width: 168,
          height: 168,
          background:
            "conic-gradient(from 0deg, transparent 65%, var(--color-brand-weak-strong) 100%)",
        }}
      />

      {/* 扫描点（随扇形旋转）*/}
      <div
        className="animate-radar-sweep"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: 0,
          height: 0,
          transformOrigin: "0 0",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -84,
            left: -3,
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "var(--color-brand)",
            boxShadow: "0 0 8px 2px var(--color-brand-weak-strong)",
            opacity: 0.9,
          }}
        />
      </div>

      {/* 中心亮点 */}
      <div
        className="absolute h-2 w-2 rounded-full animate-radar-pulse"
        style={{ background: "var(--color-brand)", opacity: 0.7 }}
      />
    </div>
  );
}

/* ── 步骤卡片 ─────────────────────────────────────────────────── */
function StepCard({
  step,
  delay,
}: {
  step: (typeof STEPS)[0];
  delay: number;
}) {
  return (
    <div
      className="animate-fade-up flex items-center gap-3.5 rounded-xl p-3.5 shadow-card"
      style={{
        background: "var(--color-bg-surface)",
        animationDelay: `${delay}s`,
      }}
    >
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]"
        style={{
          background: "var(--color-brand-weak)",
          color: "var(--color-brand)",
        }}
      >
        {step.icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-1.5">
          <span
            className="text-tiny font-semibold"
            style={{ color: "var(--color-brand)", opacity: 0.55 }}
          >
            {step.num}
          </span>
          <span
            className="text-[13px] font-semibold"
            style={{ color: "var(--color-text-primary)" }}
          >
            {step.title}
          </span>
        </div>
        <p
          className="mt-0.5 text-[11px] leading-snug"
          style={{ color: "var(--color-text-tertiary)" }}
        >
          {step.desc}
        </p>
      </div>
    </div>
  );
}

/* ── 主视图 ──────────────────────────────────────────────────── */
export default function OnboardingView() {
  const router = useRouter();

  return (
    <div
      className="flex min-h-dvh flex-col"
      style={{ background: "var(--color-bg-page)" }}
    >
      {/* ── 雷达区域 ─────────────────────────────────────────── */}
      <div
        className="relative flex items-center justify-center"
        style={{ height: "40vh", minHeight: 260 }}
      >
        <RadarVisual />

        {/* 中心徽章 */}
        <div className="animate-fade-up relative z-10 flex flex-col items-center gap-3">
          <div
            className="flex items-center justify-center font-bold text-white"
            style={{
              width: 60,
              height: 60,
              fontSize: 26,
              borderRadius: 16,
              letterSpacing: "-0.02em",
              background: "var(--color-brand)",
              boxShadow: "0 8px 28px var(--color-brand-weak-strong)",
            }}
          >
            F
          </div>

          {/* 状态徽标 */}
          <div
            className="flex items-center gap-1.5 rounded-pill px-3 py-1"
            style={{
              background: "var(--color-background-success)",
              color: "var(--color-text-success)",
            }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: "var(--color-text-success)" }}
            />
            <span className="text-tiny font-semibold">雷达已就绪</span>
          </div>
        </div>
      </div>

      {/* ── 文字 + 步骤 + CTA ─────────────────────────────────── */}
      <div className="flex flex-1 flex-col px-page pb-10">
        {/* 欢迎标题 */}
        <div
          className="animate-fade-up text-center"
          style={{ animationDelay: "0.06s" }}
        >
          <h1
            className="text-[22px] font-semibold"
            style={{
              color: "var(--color-text-primary)",
              letterSpacing: "-0.02em",
            }}
          >
            欢迎来到 FameScope
          </h1>
          <p
            className="mt-2 text-[13px] leading-relaxed"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            添加你关注的领域，开始接收来自<br />
            意见领袖的高价值信号
          </p>
        </div>

        {/* 三步卡 */}
        <div className="mt-5 space-y-2.5">
          {STEPS.map((step, i) => (
            <StepCard key={step.num} step={step} delay={0.12 + i * 0.07} />
          ))}
        </div>

        {/* CTA 按钮区 */}
        <div
          className="animate-fade-up mt-7 space-y-2.5"
          style={{ animationDelay: "0.34s" }}
        >
          <button
            type="button"
            onClick={() => router.push("/discover")}
            className="flex w-full items-center justify-center gap-2 rounded-pill py-4 text-[15px] font-semibold text-white transition-opacity active:opacity-80"
            style={{ background: "var(--color-brand)" }}
          >
            添加第一个信源
            <IconArrowRight size={17} stroke={2.3} />
          </button>

          <button
            type="button"
            onClick={() => router.push("/")}
            className="flex w-full items-center justify-center gap-1 py-2.5 text-[13px] transition-opacity active:opacity-60"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            先随便看看
            <IconChevronRight size={14} stroke={1.8} />
          </button>
        </div>
      </div>
    </div>
  );
}
