import { ChevronDownIcon, FilterIcon } from "@/components/icons";

// Visual only for now — no filter/sort logic wired up until the real
// catalog query exists.
export function CatalogToolbar() {
  return (
    <div className="mt-10 flex items-center justify-between border-y border-black/10 py-4 text-sm sm:mt-14">
      <button
        type="button"
        className="flex items-center gap-2 hover:opacity-70"
      >
        <FilterIcon />
        Filters
      </button>
      <button
        type="button"
        className="flex items-center gap-2 hover:opacity-70"
      >
        Sort by
        <ChevronDownIcon />
      </button>
    </div>
  );
}
