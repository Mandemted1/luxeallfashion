"use client";

import { CirclePlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

export interface FacetedFilterOption {
  value: string;
  label: string;
  count: number;
}

// The compact "Status"/"Payment" style button-that-opens-a-checklist used
// across data tables (the shadcn-admin Tasks page pattern) — collapses N
// individual toggle buttons into one control, so a toolbar with several
// filter dimensions doesn't turn into a wall of pills.
export function FacetedFilter({
  title,
  options,
  selected,
  onChange,
}: {
  title: string;
  options: FacetedFilterOption[];
  selected: Set<string>;
  onChange: (next: Set<string>) => void;
}) {
  function toggle(value: string) {
    const next = new Set(selected);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    onChange(next);
  }

  const selectedOptions = options.filter((option) => selected.has(option.value));

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="border-dashed">
          <CirclePlus />
          {title}
          {selectedOptions.length > 0 && (
            <>
              <Separator orientation="vertical" className="mx-1 h-4" />
              <Badge variant="secondary" className="rounded-sm px-1.5 font-normal lg:hidden">
                {selectedOptions.length}
              </Badge>
              <div className="hidden gap-1 lg:flex">
                {selectedOptions.length > 2 ? (
                  <Badge variant="secondary" className="rounded-sm px-1.5 font-normal">
                    {selectedOptions.length} selected
                  </Badge>
                ) : (
                  selectedOptions.map((option) => (
                    <Badge
                      key={option.value}
                      variant="secondary"
                      className="rounded-sm px-1.5 font-normal"
                    >
                      {option.label}
                    </Badge>
                  ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-52 p-0" align="start">
        <Command>
          <CommandInput placeholder={title} />
          <CommandList>
            <CommandEmpty>No results.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selected.has(option.value);
                return (
                  <CommandItem key={option.value} onSelect={() => toggle(option.value)}>
                    <Checkbox checked={isSelected} className="mr-1" />
                    <span>{option.label}</span>
                    <span className="ml-auto text-xs text-muted-foreground">{option.count}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
