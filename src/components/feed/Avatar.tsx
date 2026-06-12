import type { FeedSource } from "@/lib/fixtures/feed";

/**
 * 头像：个人圆形、官方 9px 圆角方形。
 * 不加载真实图片（媒体处理原则 + 离线可用），用首字母色块代替。
 */
export default function Avatar({
  source,
  size = 36,
}: {
  source: FeedSource;
  size?: number;
}) {
  const isOrg = source.type === "org";
  return (
    <span
      aria-hidden
      className="flex shrink-0 items-center justify-center font-medium text-white"
      style={{
        width: size,
        height: size,
        borderRadius: isOrg ? "9px" : "50%",
        background: source.avatarTint,
        fontSize: size * 0.42,
        lineHeight: 1,
      }}
    >
      {source.avatarText}
    </span>
  );
}
