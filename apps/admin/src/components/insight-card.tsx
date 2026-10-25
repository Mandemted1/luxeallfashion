import type { ElementType } from "react";
import { Card, CardContent } from "@/components/ui/card";

export function InsightCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint: string;
  icon: ElementType;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Icon className="size-4 text-black/50" />
          <p className="text-sm text-black/60">{label}</p>
        </div>
        <p className="text-3xl font-semibold">{value}</p>
        <p className="text-xs text-black/40">{hint}</p>
      </CardContent>
    </Card>
  );
}
