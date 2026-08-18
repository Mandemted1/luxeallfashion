import { brandFilters, type BrandFilter } from "@/lib/mock-dashboard-data";

interface BrandTabsProps {
  value: BrandFilter;
  onChange: (brand: BrandFilter) => void;
}

export function BrandTabs({ value, onChange }: BrandTabsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {brandFilters.map((filter) => (
        <button
          key={filter.value}
          type="button"
          onClick={() => onChange(filter.value)}
          aria-pressed={value === filter.value}
          className={`px-4 py-2 text-xs font-medium uppercase tracking-[0.1em] transition-colors ${
            value === filter.value
              ? "bg-black text-white"
              : "border border-black/15 bg-white text-black/60 hover:border-black/40 hover:text-black"
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
