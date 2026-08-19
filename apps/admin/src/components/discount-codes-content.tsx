"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  createDiscountCode,
  deleteDiscountCode,
  toggleDiscountCodeActive,
} from "@/app/(app)/discount-codes/actions";
import { TrashIcon } from "@/components/icons";
import { brandFilters, brandLabel, type BrandFilter } from "@/lib/brands";
import {
  formatDiscountValue,
  isExpired,
  type AdminDiscountCode,
} from "@/lib/discount-codes";

export function DiscountCodesContent({ codes }: { codes: AdminDiscountCode[] }) {
  const router = useRouter();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [code, setCode] = useState("");
  const [type, setType] = useState<"percentage" | "fixed">("percentage");
  const [value, setValue] = useState("");
  const [brandFilter, setBrandFilter] = useState<BrandFilter>("all");
  const [expiresAt, setExpiresAt] = useState("");
  const [error, setError] = useState("");

  async function toggleActive(id: string) {
    const result = await toggleDiscountCodeActive(id);
    if (!result.error) router.refresh();
  }

  async function deleteCode(id: string) {
    const result = await deleteDiscountCode(id);
    setConfirmDeleteId(null);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

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
    });

    setSubmitting(false);
    if (result.error) {
      setError(result.error);
      return;
    }

    setCode("");
    setValue("");
    setExpiresAt("");
    setBrandFilter("all");
    router.refresh();
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold">Discount Codes</h1>

      <div className="mt-6 overflow-x-auto border border-black/10 bg-white">
        <table className="w-full min-w-[820px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-black/10 text-left text-xs font-medium uppercase tracking-[0.08em] text-black/50">
              <th className="px-5 py-3 font-medium">Code</th>
              <th className="px-5 py-3 font-medium">Discount</th>
              <th className="px-5 py-3 font-medium">Store</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Expires</th>
              <th className="px-5 py-3 font-medium">Uses</th>
              <th className="px-5 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {codes.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-black/40">
                  No discount codes yet.
                </td>
              </tr>
            ) : (
              codes.map((discount) => {
                const expired = isExpired(discount);
                return (
                  <tr key={discount.id} className="border-b border-black/5 last:border-b-0">
                    <td className="px-5 py-4 font-mono text-xs font-semibold tracking-wide">
                      {discount.code}
                    </td>
                    <td className="px-5 py-4">{formatDiscountValue(discount)}</td>
                    <td className="px-5 py-4 text-black/60">
                      {discount.brandFilter === "all"
                        ? "All Stores"
                        : brandLabel(discount.brandFilter)}
                    </td>
                    <td className="px-5 py-4">
                      {expired ? (
                        <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium uppercase tracking-[0.06em] text-black/40">
                          Expired
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => toggleActive(discount.id)}
                          className={`inline-flex items-center px-2 py-0.5 text-xs font-medium uppercase tracking-[0.06em] ${
                            discount.isActive
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-stone-100 text-stone-500"
                          }`}
                        >
                          {discount.isActive ? "Active" : "Inactive"}
                        </button>
                      )}
                    </td>
                    <td className="px-5 py-4 text-black/60">
                      {discount.expiresAt ?? "No expiry"}
                    </td>
                    <td className="px-5 py-4 text-black/60">
                      {discount.usageCount} / {discount.usageLimit ?? "∞"}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {confirmDeleteId === discount.id ? (
                        <button
                          type="button"
                          onClick={() => deleteCode(discount.id)}
                          onBlur={() => setConfirmDeleteId(null)}
                          className="text-xs font-medium uppercase tracking-[0.06em] text-red-600 hover:text-red-700"
                        >
                          Confirm?
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(discount.id)}
                          aria-label={`Delete ${discount.code}`}
                          className="p-1.5 text-black/40 hover:text-red-600"
                        >
                          <TrashIcon />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <form
        onSubmit={submit}
        className="mt-6 flex flex-wrap items-end gap-3 border border-black/10 bg-white p-6"
      >
        <label className="flex flex-col gap-1 text-xs text-black/50">
          Code
          <input
            type="text"
            value={code}
            onChange={(event) => {
              setCode(event.target.value);
              setError("");
            }}
            placeholder="SUMMER25"
            className="w-36 border border-black/15 bg-white px-3 py-2 text-sm uppercase focus:border-black focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1 text-xs text-black/50">
          Type
          <select
            value={type}
            onChange={(event) => setType(event.target.value as "percentage" | "fixed")}
            className="border border-black/15 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none"
          >
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed Amount</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs text-black/50">
          {type === "percentage" ? "Percent Off" : "Amount Off (GHS)"}
          <input
            type="number"
            min={0}
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              setError("");
            }}
            placeholder={type === "percentage" ? "10" : "50"}
            className="w-24 border border-black/15 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1 text-xs text-black/50">
          Store
          <select
            value={brandFilter}
            onChange={(event) => setBrandFilter(event.target.value as BrandFilter)}
            className="border border-black/15 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none"
          >
            {brandFilters.map((filter) => (
              <option key={filter.value} value={filter.value}>
                {filter.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs text-black/50">
          Expires (optional)
          <input
            type="date"
            value={expiresAt}
            onChange={(event) => setExpiresAt(event.target.value)}
            className="border border-black/15 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none"
          />
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="bg-black px-5 py-2.5 text-xs font-medium uppercase tracking-[0.1em] text-white transition-colors hover:bg-stone-800 disabled:opacity-50"
        >
          {submitting ? "Adding..." : "Add Code"}
        </button>
      </form>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
