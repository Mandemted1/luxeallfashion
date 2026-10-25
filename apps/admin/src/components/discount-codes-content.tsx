"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlertTriangle, Percent, Tag, TrendingUp, Trash2 } from "lucide-react";
import {
  createDiscountCode,
  deleteDiscountCode,
  toggleDiscountCodeActive,
} from "@/app/(app)/discount-codes/actions";
import { InsightCard } from "@/components/insight-card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { brandFilters, brandLabel, type BrandFilter } from "@/lib/brands";
import { formatGhs } from "@/lib/currency";
import {
  formatDiscountValue,
  isExpired,
  isExpiringSoon,
  type AdminDiscountCode,
} from "@/lib/discount-codes";

const labelClass = "flex flex-col gap-1.5 text-xs font-medium tracking-[0.1em] text-black/50 uppercase";

export interface DiscountInsights {
  activeCount: number;
  totalDiscountGivenGhs: number;
  mostUsedCode: string | null;
  mostUsedCount: number;
  expiringSoonCount: number;
}

function StatusCell({ discount, onToggle }: { discount: AdminDiscountCode; onToggle: () => void }) {
  if (isExpired(discount)) {
    return (
      <Badge variant="outline" className="border-transparent bg-stone-100 text-stone-600">
        Expired
      </Badge>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <Switch checked={discount.isActive} onCheckedChange={onToggle} aria-label={`Toggle ${discount.code}`} />
      <span className={`text-xs font-medium uppercase tracking-[0.06em] ${
        discount.isActive ? "text-emerald-700" : "text-stone-500"
      }`}>
        {discount.isActive ? "Active" : "Inactive"}
      </span>
      {isExpiringSoon(discount) && (
        <Badge variant="outline" className="border-transparent bg-amber-50 text-amber-700">
          Expiring soon
        </Badge>
      )}
    </div>
  );
}

function NewCodeForm({ onCreated }: { onCreated: () => void }) {
  const [code, setCode] = useState("");
  const [type, setType] = useState<"percentage" | "fixed">("percentage");
  const [value, setValue] = useState("");
  const [brandFilter, setBrandFilter] = useState<BrandFilter>("all");
  const [expiresAt, setExpiresAt] = useState("");
  const [usageLimit, setUsageLimit] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    const result = await createDiscountCode({
      code,
      type,
      value: Number(value),
      brandFilter,
      expiresAt,
      usageLimit: usageLimit ? Number(usageLimit) : null,
    });

    setSubmitting(false);
    if (result.error) {
      setError(result.error);
      return;
    }

    onCreated();
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      <label className={labelClass}>
        Code
        <Input
          value={code}
          onChange={(event) => {
            setCode(event.target.value);
            setError("");
          }}
          placeholder="SUMMER25"
          className="uppercase"
        />
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className={labelClass}>
          Type
          <Select value={type} onValueChange={(next) => setType(next as "percentage" | "fixed")}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="percentage">Percentage</SelectItem>
              <SelectItem value="fixed">Fixed Amount</SelectItem>
            </SelectContent>
          </Select>
        </label>

        <label className={labelClass}>
          {type === "percentage" ? "Percent Off" : "Amount Off (GHS)"}
          <Input
            type="number"
            min={0}
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              setError("");
            }}
            placeholder={type === "percentage" ? "10" : "50"}
          />
        </label>
      </div>

      <label className={labelClass}>
        Store
        <Select value={brandFilter} onValueChange={(next) => setBrandFilter(next as BrandFilter)}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {brandFilters.map((filter) => (
              <SelectItem key={filter.value} value={filter.value}>
                {filter.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className={labelClass}>
          Expires (optional)
          <Input type="date" value={expiresAt} onChange={(event) => setExpiresAt(event.target.value)} />
        </label>

        <label className={labelClass}>
          Max Uses (optional)
          <Input
            type="number"
            min={1}
            step={1}
            value={usageLimit}
            onChange={(event) => setUsageLimit(event.target.value)}
            placeholder="Unlimited"
          />
        </label>
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <Button type="submit" disabled={submitting} className="mt-2">
        {submitting ? "Adding..." : "Add Code"}
      </Button>
    </form>
  );
}

export function DiscountCodesContent({
  codes,
  insights,
}: {
  codes: AdminDiscountCode[];
  insights: DiscountInsights;
}) {
  const router = useRouter();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  async function toggleActive(id: string) {
    const result = await toggleDiscountCodeActive(id);
    if (!result.error) router.refresh();
  }

  async function handleDelete() {
    if (!confirmDeleteId) return;
    setDeleting(true);
    const result = await deleteDiscountCode(confirmDeleteId);
    setDeleting(false);
    if (result.error) {
      setDeleteError(result.error);
      setConfirmDeleteId(null);
      return;
    }
    setConfirmDeleteId(null);
    router.refresh();
  }

  const deletingCode = codes.find((c) => c.id === confirmDeleteId);

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Discount Codes</h1>
          <p className="mt-1 text-sm text-black/50">Create and manage promo codes.</p>
        </div>
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button>+ New Code</Button>
          </SheetTrigger>
          <SheetContent className="overflow-y-auto data-[side=right]:w-full data-[side=right]:sm:max-w-xl">
            <SheetHeader>
              <SheetTitle>New Discount Code</SheetTitle>
              <SheetDescription>Create a promo code for one or all stores.</SheetDescription>
            </SheetHeader>
            <div className="px-4 pb-4">
              <NewCodeForm
                onCreated={() => {
                  setSheetOpen(false);
                  router.refresh();
                }}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <InsightCard
          label="Active Codes"
          value={String(insights.activeCount)}
          hint={`${codes.length} total codes`}
          icon={Tag}
        />
        <InsightCard
          label="Discount Given"
          value={formatGhs(insights.totalDiscountGivenGhs)}
          hint="Across all paid orders, all time"
          icon={Percent}
        />
        <InsightCard
          label="Most Used Code"
          value={insights.mostUsedCode ?? "–"}
          hint={insights.mostUsedCode ? `Used ${insights.mostUsedCount} times` : "No codes used yet"}
          icon={TrendingUp}
        />
        <InsightCard
          label="Expiring Soon"
          value={String(insights.expiringSoonCount)}
          hint="Within the next 7 days"
          icon={AlertTriangle}
        />
      </div>

      <Card className="mt-6 gap-0 py-0">
        <div className="overflow-x-auto">
          <Table className="min-w-[900px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Code</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Store</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead className="text-right">Uses</TableHead>
                <TableHead className="text-right">Revenue Generated</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {codes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-10 text-center text-black/40">
                    No discount codes yet.
                  </TableCell>
                </TableRow>
              ) : (
                codes.map((discount) => (
                  <TableRow key={discount.id}>
                    <TableCell className="font-mono text-xs font-semibold tracking-wide">
                      {discount.code}
                    </TableCell>
                    <TableCell>{formatDiscountValue(discount)}</TableCell>
                    <TableCell className="text-black/60">
                      {discount.brandFilter === "all" ? "All Stores" : brandLabel(discount.brandFilter)}
                    </TableCell>
                    <TableCell>
                      <StatusCell discount={discount} onToggle={() => toggleActive(discount.id)} />
                    </TableCell>
                    <TableCell className="text-black/60">{discount.expiresAt ?? "No expiry"}</TableCell>
                    <TableCell className="text-right text-black/60">
                      {discount.usageCount} / {discount.usageLimit ?? "∞"}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {discount.revenueGeneratedGhs > 0 ? formatGhs(discount.revenueGeneratedGhs) : "–"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => {
                          setDeleteError("");
                          setConfirmDeleteId(discount.id);
                        }}
                        aria-label={`Delete ${discount.code}`}
                        className="text-black/40 hover:text-red-600"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
      {deleteError && <p className="mt-2 text-xs text-red-600">{deleteError}</p>}

      <AlertDialog open={confirmDeleteId !== null} onOpenChange={(open) => !deleting && !open && setConfirmDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &quot;{deletingCode?.code}&quot;?</AlertDialogTitle>
            <AlertDialogDescription>
              This can&apos;t be undone. Codes already used on real orders can&apos;t be deleted.
              Deactivate them instead.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleting}
              onClick={(event) => {
                event.preventDefault();
                handleDelete();
              }}
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
