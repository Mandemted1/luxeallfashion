import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { brandFilters, type BrandFilter } from "@/lib/brands";

interface BrandTabsProps {
  value: BrandFilter;
  onChange: (brand: BrandFilter) => void;
}

export function BrandTabs({ value, onChange }: BrandTabsProps) {
  return (
    <Tabs
      value={value}
      onValueChange={(next) => onChange(next as BrandFilter)}
      className="max-w-full overflow-x-auto [&_*]:transition-none"
    >
      <TabsList variant="line" className="w-max">
        {brandFilters.map((filter) => (
          <TabsTrigger
            key={filter.value}
            value={filter.value}
            className="shrink-0 focus-visible:border-transparent focus-visible:ring-0 focus-visible:outline-none"
          >
            {filter.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
