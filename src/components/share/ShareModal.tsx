"use client";

import { useEffect, useRef, useState } from "react";
import { IconX, IconCopy, IconCheck, IconPhoto, IconShare3 } from "@tabler/icons-react";
import { toPng } from "html-to-image";
import type { FeedTweet, FeedArticle } from "@/lib/fixtures/feed";
import ShareCard from "./ShareCard";

type Content = FeedTweet | FeedArticle;

export default function ShareModal({
  content,
  onClose,
}: {
  content: Content;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: ignore
    }
  }

  async function handleShareImage() {
    if (!cardRef.current || sharing) return;
    setSharing(true);
    try {
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 2, cacheBust: true });
      const blob = await fetch(dataUrl).then((r) => r.blob());
      const file = new File([blob], "famescope.png", { type: "image/png" });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file] }).catch(() => {});
      } else {
        // 不支持文件分享时，下载图片
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = "famescope.png";
        a.click();
      }
    } catch {
      // fallback to URL share
      if (navigator.share) {
        await navigator.share({ title: "FameScope", url: window.location.href }).catch(() => {});
      }
    } finally {
      setSharing(false);
    }
  }

  return (
    <div
      className="animate-backdrop-in fixed inset-0 z-50 flex items-end"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className="animate-slide-up w-full rounded-t-2xl pb-safe"
        style={{ background: "var(--color-bg-elevated)", boxShadow: "0 -8px 40px rgba(0,0,0,0.25)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="flex justify-center pb-2 pt-3">
          <span
            className="h-1 w-9 rounded-full"
            style={{ background: "var(--color-border-strong)" }}
          />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-page pb-3 pt-0.5">
          <span className="text-[15px] font-semibold" style={{ color: "var(--color-text-primary)" }}>
            分享内容
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭"
            className="flex h-7 w-7 items-center justify-center rounded-full transition-opacity active:opacity-60"
            style={{
              background: "var(--color-bg-surface-2)",
              color: "var(--color-text-secondary)",
            }}
          >
            <IconX size={14} stroke={2.5} />
          </button>
        </div>

        {/* Card preview — ref 绑在这里，截图时只抓这个 div */}
        <div ref={cardRef} className="px-page">
          <ShareCard content={content} />
        </div>

        {/* Hint */}
        <p
          className="mt-3 px-page text-center text-tiny"
          style={{ color: "var(--color-text-tertiary)" }}
        >
          点击「分享图片」保存或发送给朋友
        </p>

        {/* Action buttons */}
        <div className="mt-3 flex gap-3 px-page pb-8">
          <ActionBtn
            icon={copied ? <IconCheck size={19} stroke={1.7} /> : <IconCopy size={19} stroke={1.7} />}
            label={copied ? "已复制" : "复制链接"}
            onClick={handleCopy}
            active={copied}
          />
          <ActionBtn
            icon={sharing
              ? <IconPhoto size={19} stroke={1.7} className="animate-pulse" />
              : <IconShare3 size={19} stroke={1.7} />
            }
            label={sharing ? "生成中…" : "分享图片"}
            onClick={handleShareImage}
          />
        </div>
      </div>
    </div>
  );
}

function ActionBtn({
  icon,
  label,
  onClick,
  active,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-1 flex-col items-center gap-2 rounded-xl py-4 transition-all active:scale-95 active:opacity-70"
      style={{ background: active ? "var(--color-background-success, #e6f6ed)" : "var(--color-bg-surface-2)" }}
    >
      <span style={{ color: active ? "var(--color-text-success, #1f7a4d)" : "var(--color-brand)" }}>{icon}</span>
      <span
        className="text-tiny font-medium"
        style={{ color: active ? "var(--color-text-success, #1f7a4d)" : "var(--color-text-secondary)" }}
      >
        {label}
      </span>
    </button>
  );
}
