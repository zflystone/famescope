"use client";

import { useRouter } from "next/navigation";
import { IconArrowLeft } from "@tabler/icons-react";

type Section = {
  title: string;
  content: string;
};

function renderContent(text: string) {
  return text.split("\n").map((line, i) => {
    if (line.startsWith("**") && line.endsWith("**")) {
      return (
        <p key={i} className="mt-4 mb-1 font-semibold" style={{ color: "var(--color-text-primary)", fontSize: "14px" }}>
          {line.slice(2, -2)}
        </p>
      );
    }
    if (line.startsWith("- ")) {
      return (
        <div key={i} className="flex gap-2" style={{ color: "var(--color-text-secondary)", fontSize: "14px", lineHeight: "1.7" }}>
          <span style={{ flexShrink: 0, color: "var(--color-text-tertiary)" }}>·</span>
          <span>{renderInline(line.slice(2))}</span>
        </div>
      );
    }
    if (line.trim() === "") return <div key={i} className="h-2" />;
    return (
      <p key={i} style={{ color: "var(--color-text-secondary)", fontSize: "14px", lineHeight: "1.75" }}>
        {renderInline(line)}
      </p>
    );
  });
}

function renderInline(text: string) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1
      ? <strong key={i} style={{ color: "var(--color-text-primary)", fontWeight: 600 }}>{part}</strong>
      : part
  );
}

export default function LegalPage({ title, sections }: { title: string; sections: Section[] }) {
  const router = useRouter();
  return (
    <div className="min-h-dvh" style={{ background: "var(--color-bg-page)" }}>
      {/* 顶部导航栏 */}
      <header
        className="sticky top-0 z-20 border-b"
        style={{
          background: "var(--color-bg-page)",
          borderColor: "var(--color-border)",
        }}
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
          <span
            className="text-[17px] font-semibold"
            style={{ color: "var(--color-text-primary)", letterSpacing: "-0.01em" }}
          >
            {title}
          </span>
        </div>
      </header>

      {/* 正文 */}
      <div className="mx-auto max-w-app px-page pb-20 pt-6">
        {sections.map((section, i) => (
          <section key={i} className="mb-8">
            {/* 章节序号 + 标题 */}
            <div className="mb-3 flex items-center gap-2.5">
              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[11px] font-bold"
                style={{
                  background: "var(--color-brand-weak)",
                  color: "var(--color-brand)",
                }}
              >
                {i + 1}
              </span>
              <h2
                className="text-[16px] font-semibold"
                style={{ color: "var(--color-text-primary)", letterSpacing: "-0.01em" }}
              >
                {section.title}
              </h2>
            </div>

            {/* 内容 */}
            <div
              className="rounded-xl px-4 py-4"
              style={{ background: "var(--color-bg-surface)" }}
            >
              <div className="space-y-1">
                {renderContent(section.content)}
              </div>
            </div>
          </section>
        ))}

        <p
          className="text-center text-[12px]"
          style={{ color: "var(--color-text-tertiary)" }}
        >
          © 2026 FameScope · famescope.cn
        </p>
      </div>
    </div>
  );
}
