"use client";

import { useState } from "react";
import type { AdminCategoryItem } from "@/components/categories-content";
import { PencilIcon, TrashIcon } from "@/components/icons";

export function CategoryRow({
  category,
  productCount,
  onRename,
  onDelete,
}: {
  category: AdminCategoryItem;
  productCount: number;
  onRename: (id: string, name: string) => Promise<{ error?: string }>;
  onDelete: (id: string) => Promise<{ error?: string }>;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(category.name);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  async function save() {
    const trimmed = name.trim();
    if (trimmed && trimmed !== category.name) {
      const result = await onRename(category.id, trimmed);
      if (result.error) {
        setName(category.name);
      }
    } else {
      setName(category.name);
    }
    setEditing(false);
  }

  async function handleDelete() {
    const result = await onDelete(category.id);
    if (result.error) {
      setDeleteError(result.error);
      setConfirmingDelete(false);
    }
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
          {deleteError && <p className="mt-0.5 text-xs text-red-600">{deleteError}</p>}
        </div>
      )}

      <div className="flex shrink-0 items-center gap-1">
        {confirmingDelete ? (
          <button
            type="button"
            onClick={handleDelete}
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
              onClick={() => {
                setDeleteError("");
                setConfirmingDelete(true);
              }}
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
