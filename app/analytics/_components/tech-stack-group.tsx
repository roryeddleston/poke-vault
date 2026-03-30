import { SurfaceCard } from "@/components/SurfaceCard";

type TechStackGroupProps = {
  title: string;
  items: string[];
};

export function TechStackGroup({ title, items }: TechStackGroupProps) {
  return (
    <SurfaceCard as="article" className="p-5">
      <h3 className="text-sm font-semibold tracking-[0.06em] text-text-main uppercase">
        {title}
      </h3>
      <div className="mt-4 flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className="inline-flex rounded-full border border-border-subtle bg-surface px-3 py-1.5 text-xs font-medium text-text-main"
          >
            {item}
          </span>
        ))}
      </div>
    </SurfaceCard>
  );
}
