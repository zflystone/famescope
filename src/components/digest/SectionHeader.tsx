/** 简报各节标题：左侧 3px 品牌紫竖线 + 标题 + 可选说明。*/
export default function SectionHeader({
  icon,
  title,
  sub,
}: {
  icon: React.ReactNode;
  title: string;
  sub?: string;
}) {
  return (
    <div
      className="flex items-center gap-2.5 pl-3"
      style={{ borderLeft: "3px solid var(--color-brand)" }}
    >
      <span className="text-brand">{icon}</span>
      <div>
        <h2 className="text-[14px] font-semibold text-content-primary">{title}</h2>
        {sub && <p className="text-tiny text-content-tertiary">{sub}</p>}
      </div>
    </div>
  );
}
