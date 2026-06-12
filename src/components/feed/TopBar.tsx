import { IconSearch } from "@tabler/icons-react";
import ThemeToggle from "@/components/theme/ThemeToggle";

/**
 * 顶部栏：品牌 Logo（26px 方形徽章 + FameScope 字样）+ 右侧搜索 / 主题切换。
 * 主题切换最终归属设置页，这里临时放出来方便预览双色模式。
 */
export default function TopBar() {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-white dark:bg-[#0d0c12]">
      <div className="mx-auto flex h-14 max-w-app items-center justify-between px-page">
        <div className="flex items-center gap-2">
          <span
            className="flex h-[26px] w-[26px] items-center justify-center text-[15px] font-bold text-brand-on"
            style={{
              background:
                "linear-gradient(135deg, var(--color-brand), var(--color-brand-strong))",
              borderRadius: "8px",
            }}
          >
            F
          </span>
          <span className="text-brand font-medium text-content-primary">
            FameScope
          </span>
        </div>

        <div className="flex items-center gap-0.5">
          <ThemeToggle />
          <button
            type="button"
            aria-label="搜索"
            className="flex h-9 w-9 items-center justify-center rounded-md text-content-secondary transition-colors active:bg-surface-hover"
          >
            <IconSearch size={20} stroke={1.8} />
          </button>
        </div>
      </div>
    </header>
  );
}
