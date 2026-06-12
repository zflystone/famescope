/** 标签行：小号胶囊，弱底，可换行。 */
export default function TagRow({ tags }: { tags: string[] }) {
  if (!tags.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((t) => (
        <span
          key={t}
          className="rounded-pill bg-surface-2 px-2 py-0.5 text-tiny text-content-secondary"
        >
          #{t}
        </span>
      ))}
    </div>
  );
}
