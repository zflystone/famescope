/**
 * 简报日期徽章 + 期号——editorial "morning paper" 感觉。
 * 故意用 font-serif (Noto Serif SC) 衬线字来和信息流的 sans 形成气质差异。
 */
export default function DigestMasthead({ date, issue }: { date: string; issue: string }) {
  return (
    <div
      className="relative overflow-hidden rounded-xl px-5 py-5"
      style={{
        background:
          "linear-gradient(135deg, var(--color-brand) 0%, var(--color-brand-strong) 100%)",
      }}
    >
      {/* 装饰性大字背景 */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-3 -top-4 font-serif text-[88px] font-semibold leading-none text-white/10 select-none"
      >
        简
      </span>

      <p className="text-tiny font-medium uppercase tracking-widest text-white/60">
        FameScope · 每日简报
      </p>
      <h1 className="mt-1 font-serif text-[20px] font-semibold leading-snug text-white">
        {date}
      </h1>
      <p className="mt-0.5 text-tiny text-white/55">{issue}</p>
    </div>
  );
}
