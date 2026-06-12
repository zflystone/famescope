"use client";

import { useEffect, useState } from "react";
import { IconSun, IconMoon } from "@tabler/icons-react";

const STORAGE_KEY = "famescope-theme";

export function useTheme() {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const root = document.documentElement;
    root.classList.add("theme-transition");
    const next = !root.classList.contains("dark");
    root.classList.toggle("dark", next);
    try {
      localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
    } catch {}
    setDark(next);
    window.setTimeout(() => root.classList.remove("theme-transition"), 300);
  }

  return { theme: dark ? "dark" : "light", dark, mounted, toggle };
}

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const { dark, mounted, toggle } = useTheme();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "切换到浅色模式" : "切换到深色模式"}
      className={`flex h-9 w-9 items-center justify-center rounded-md text-content-secondary transition-colors active:bg-surface-hover ${className}`}
    >
      {mounted ? (
        dark ? (
          <IconSun size={20} stroke={1.8} />
        ) : (
          <IconMoon size={20} stroke={1.8} />
        )
      ) : (
        <span className="h-5 w-5" />
      )}
    </button>
  );
}
