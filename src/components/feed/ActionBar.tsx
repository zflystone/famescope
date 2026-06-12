"use client";

import { IconLanguage, IconStar, IconShare3 } from "@tabler/icons-react";

const BTN =
  "flex h-[38px] w-[38px] items-center justify-center rounded-md transition-colors";

/**
 * 卡片底部操作栏：原文 / 收藏 / 分享，三个纯图标按钮，右对齐，38×38。
 * - 原文：推文用 onToggleOriginal 切换英文原文（激活态品牌弱底）；
 *         新闻传 originalHref，点击跳官网原文。
 * - 收藏：激活态琥珀底
 * - 分享：恒为 Info 底
 */
export default function ActionBar({
  showOriginal = false,
  onToggleOriginal,
  originalHref,
  isStarred,
  onToggleStar,
  onShare,
}: {
  showOriginal?: boolean;
  onToggleOriginal?: () => void;
  originalHref?: string;
  isStarred: boolean;
  onToggleStar: () => void;
  onShare: () => void;
}) {
  return (
    <div className="mt-1 flex items-center justify-end gap-1.5 border-t border-line-divider pt-2">
      {originalHref ? (
        <a
          href={originalHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="查看原文"
          className={`${BTN} text-content-secondary active:bg-surface-hover`}
        >
          <IconLanguage size={19} stroke={1.7} />
        </a>
      ) : onToggleOriginal ? (
        <button
          type="button"
          onClick={onToggleOriginal}
          aria-pressed={showOriginal}
          aria-label="查看原文"
          className={`${BTN} ${
            showOriginal
              ? "bg-brand-weak text-brand"
              : "text-content-secondary active:bg-surface-hover"
          }`}
        >
          <IconLanguage size={19} stroke={1.7} />
        </button>
      ) : null}

      <button
        type="button"
        onClick={onToggleStar}
        aria-pressed={isStarred}
        aria-label={isStarred ? "取消收藏" : "收藏"}
        className={`${BTN} ${
          isStarred
            ? "bg-warning-bg text-warning-fg"
            : "text-content-secondary active:bg-surface-hover"
        }`}
      >
        <IconStar
          size={19}
          stroke={1.7}
          fill={isStarred ? "currentColor" : "none"}
        />
      </button>

      <button
        type="button"
        onClick={onShare}
        aria-label="分享"
        className={`${BTN} bg-info-bg text-info-fg active:opacity-80`}
      >
        <IconShare3 size={19} stroke={1.7} />
      </button>
    </div>
  );
}
