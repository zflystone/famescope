"use client";

import { useState } from "react";
import { IconBell, IconBellOff, IconTrash } from "@tabler/icons-react";
import type { DiscoverSource } from "@/lib/fixtures/discover";

export default function MySourceRow({
  source,
  onNotifyToggle,
  onUnfollow,
}: {
  source: DiscoverSource;
  onNotifyToggle?: (handle: string, notify: boolean) => void;
  onUnfollow?: (handle: string) => void;
}) {
  const [notify, setNotify] = useState(source.notifyEnabled);
  const [removing, setRemoving] = useState(false);
  const isOrg = source.type === "org";

  async function handleNotifyToggle() {
    const next = !notify;
    setNotify(next);
    try {
      await fetch("/api/sources/follow", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle: source.handle, notify: next }),
      });
      onNotifyToggle?.(source.handle, next);
    } catch {
      setNotify(!next); // revert on error
    }
  }

  async function handleUnfollow() {
    if (removing) return;
    setRemoving(true);
    try {
      await fetch("/api/sources/follow", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle: source.handle }),
      });
      onUnfollow?.(source.handle);
    } catch {
      setRemoving(false);
    }
  }

  return (
    <div className="flex items-center gap-3 border-b border-line-divider py-3 last:border-b-0">
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center text-[14px] font-bold text-white"
        style={{
          borderRadius: isOrg ? "8px" : "50%",
          background: source.avatarTint,
        }}
      >
        {source.avatarText}
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-name font-medium text-content-primary">
          {isOrg ? source.nameEn : source.nameZh}
          <span className="ml-1 text-content-tertiary">
            {isOrg ? "" : `· ${source.nameEn}`}
          </span>
        </p>
        <p className="text-tiny text-content-tertiary">
          {isOrg ? source.title : `${source.company} · ${source.title}`}
        </p>
      </div>

      {/* 实时提醒开关 */}
      <button
        type="button"
        onClick={handleNotifyToggle}
        aria-label={notify ? "关闭实时提醒" : "开启实时提醒"}
        title={notify ? "实时提醒已开启" : "开启实时提醒"}
        className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
          notify
            ? "bg-warning-bg text-warning-fg"
            : "text-content-tertiary active:bg-surface-hover"
        }`}
      >
        {notify ? (
          <IconBell size={16} stroke={1.8} />
        ) : (
          <IconBellOff size={16} stroke={1.8} />
        )}
      </button>

      {/* 取消追踪 */}
      <button
        type="button"
        onClick={handleUnfollow}
        disabled={removing}
        aria-label="取消追踪"
        className="flex h-8 w-8 items-center justify-center rounded-md text-content-tertiary disabled:opacity-40 active:bg-surface-hover"
      >
        <IconTrash size={15} stroke={1.7} />
      </button>
    </div>
  );
}
