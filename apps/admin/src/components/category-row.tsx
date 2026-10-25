"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import type { AdminCategoryItem } from "@/components/categories-content";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
  const [deleting, setDeleting] = useState(false);
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
    setDeleting(true);
    const result = await onDelete(category.id);
    setDeleting(false);
    if (result.error) {
      setDeleteError(result.error);
      setConfirmingDelete(false);
    }
  }

  return (
    <div className="flex items-center justify-between gap-3">
      {editing ? (
        <Input
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
          className="h-8 flex-1"
        />
      ) : (
        <div>
          <p className="text-sm font-medium">{category.name}</p>
          <p className="mt-0.5 text-xs text-black/40">
            /{category.slug} &middot; {productCount} {productCount === 1 ? "product" : "products"}
          </p>
          {deleteError && <p className="mt-0.5 text-xs text-red-600">{deleteError}</p>}
        </div>
      )}

      <div className="flex shrink-0 items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => setEditing(true)}
          aria-label={`Rename ${category.name}`}
        >
          <Pencil className="size-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => {
            setDeleteError("");
            setConfirmingDelete(true);
          }}
          aria-label={`Delete ${category.name}`}
          className="text-black/40 hover:text-red-600"
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>

      <AlertDialog open={confirmingDelete} onOpenChange={(open) => !deleting && setConfirmingDelete(open)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &quot;{category.name}&quot;?</AlertDialogTitle>
            <AlertDialogDescription>
              This can&apos;t be undone. Products or subcategories still using it will block the
              delete.
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
