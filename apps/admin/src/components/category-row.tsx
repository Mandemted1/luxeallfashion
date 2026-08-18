"use client";

import { useState } from "react";
import { PencilIcon, TrashIcon } from "@/components/icons";
import type { MockCategory } from "@/lib/mock-categories";

export function CategoryRow({
  category,
  productCount,
  onRename,
  onDelete,
}: {
  category: MockCategory;
  productCount: number;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(category.name);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  function save() {
    const trimmed = name.trim();
    if (trimmed && trimmed !== category.name) {
      onRename(category.id, trimmed);
    } else {
      setName(category.name);
    }
    setEditing(false);
  }

  return (
    <li className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
      {editing ? (
        <input
          autoFocus
          value={name}
          onChange={(event) => setName(event.target.value)}
          onBlur={save}
          onKeyDown={(event) => {
            if (event.key === "Enter") save();
            if (event.key === "Escape") {
              setName(category.name);
              setEditing(false);
            }
          }}
          className="flex-1 border border-black/20 px-2 py-1 text-sm focus:border-black focus:outline-none"
        />
      ) : (
        <div>
          <p className="text-sm font-medium">{category.name}</p>
          <p className="mt-0.5 text-xs text-black/40">
            /{category.slug} · {productCount} {productCount === 1 ? "product" : "products"}
          </p>
        </div>
      )}

      <div className="flex shrink-0 items-center gap-1">
        {confirmingDelete ? (
          <button
            type="button"
            onClick={() => onDelete(category.id)}
            onBlur={() => setConfirmingDelete(false)}
            className="px-2 py-1 text-xs font-medium uppercase tracking-[0.06em] text-red-600 hover:text-red-700"
          >
            Confirm?
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setEditing(true)}
              aria-label={`Rename ${category.name}`}
              className="p-1.5 text-black/40 hover:text-black"
            >
              <PencilIcon />
            </button>
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              aria-label={`Delete ${category.name}`}
              className="p-1.5 text-black/40 hover:text-red-600"
            >
              <TrashIcon />
            </button>
          </>
        )}
      </div>
    </li>
  );
}
