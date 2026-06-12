"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  IconRadar2,
  IconNews,
  IconCompass,
  IconUser,
  type Icon,
} from "@tabler/icons-react";

type NavItem = {
  key: string;
  href: string;
  label: string;
  Icon: Icon;
};

const ITEMS: NavItem[] = [
  { key: "feed", href: "/", label: "信号流", Icon: IconRadar2 },
  { key: "digest", href: "/digest", label: "简报", Icon: IconNews },
  { key: "discover", href: "/discover", label: "发现", Icon: IconCompass },
  { key: "me", href: "/me", label: "我的", Icon: IconUser },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white dark:bg-[#1a1922]"
      style={{ paddingBottom: "max(20px, env(safe-area-inset-bottom))" }}
    >
      <div className="mx-auto flex max-w-app items-stretch">
        {ITEMS.map(({ key, href, label, Icon }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname.startsWith(href);

          return (
            <button
              key={key}
              type="button"
              // onTouchStart 比 onClick 快 ~300ms，消除移动端点击延迟
              onTouchStart={() => { if (!isActive) router.push(href); }}
              onClick={() => { if (!isActive) router.push(href); }}
              className="flex flex-1 flex-col items-center gap-1 pb-0 pt-3"
              style={{ touchAction: "manipulation", background: "none", border: "none", cursor: "pointer" }}
            >
              <Icon
                size={23}
                stroke={isActive ? 2 : 1.7}
                style={{
                  color: isActive ? "var(--color-brand)" : "var(--color-text-tertiary)",
                  transform: isActive ? "translateY(-1px)" : "none",
                  transition: "color 0.15s, transform 0.15s",
                }}
              />
              <span
                className="text-tiny"
                style={{
                  fontWeight: isActive ? 500 : 400,
                  color: isActive ? "var(--color-brand)" : "var(--color-text-tertiary)",
                  transition: "color 0.15s",
                }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
