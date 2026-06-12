import { IconBulb } from "@tabler/icons-react";

/**
 * 「为什么值得看」信号提示：左侧 2px 竖线 + 琥珀背景，灯泡图标 + 一句话。
 * 两种卡片共享。
 */
export default function SignalHint({ text }: { text: string }) {
  return (
    <div
      className="flex gap-2 rounded-md bg-warning-bg py-2 pl-2.5 pr-3"
      style={{ borderLeft: "2px solid var(--color-text-warning)" }}
    >
      <IconBulb
        size={15}
        stroke={1.9}
        className="mt-px shrink-0 text-warning-fg"
      />
      <p className="text-meta font-medium leading-snug text-warning-fg">
        {text}
      </p>
    </div>
  );
}
