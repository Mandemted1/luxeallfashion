"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { undoOrderStatus } from "@/app/(app)/orders/actions";
import { Badge } from "@/components/ui/badge";
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
import {
  allowedNextStatuses,
  fulfillmentSequence,
  orderStatusChangeSendsEmail,
  type OrderStatus,
} from "@/lib/order-status";

// Mirrors UNDO_WINDOW_MS in orders/actions.ts — the server is what
// actually enforces the cutoff, this just hides the button once it would
// be rejected anyway.
const UNDO_WINDOW_MS = 6000;

// A simple progress tracker instead of a plain dropdown — a filled dot
// for every stage already reached, an outlined one for stages still
// ahead. Only stages ahead of the current one are clickable, so going
// backward isn't just discouraged, it's not a thing you can click on.
function FulfillmentSteps({
  status,
  reachable,
  onPick,
}: {
  status: OrderStatus;
  reachable: Set<OrderStatus>;
  onPick: (next: OrderStatus) => void;
}) {
  const currentIndex = fulfillmentSequence.indexOf(status);

  return (
    <div className="flex items-center">
      {fulfillmentSequence.map((stage, index) => {
        const reached = index <= currentIndex;
        const isCurrent = index === currentIndex;
        const canPick = reachable.has(stage);
        return (
          <div key={stage} className="flex items-center">
            {index > 0 && (
              <div className={`h-px w-3 ${reached ? "bg-black" : "bg-black/15"}`} />
            )}
            <button
              type="button"
              disabled={!canPick}
              onClick={() => canPick && onPick(stage)}
              title={stage}
              aria-label={stage}
              aria-current={isCurrent ? "step" : undefined}
              className={`size-2.5 rounded-full transition-colors ${
                reached
                  ? "bg-black"
                  : canPick
                    ? "cursor-pointer bg-white ring-1 ring-black/25 hover:bg-black/10 hover:ring-black/50"
                    : "cursor-default bg-white ring-1 ring-black/15"
              }`}
            />
          </div>
        );
      })}
    </div>
  );
}

interface UndoState {
  eventId: string;
  previousStatus: OrderStatus;
  changedTo: OrderStatus;
}

// Picking a new status used to commit (and email the customer) the
// instant the <select> fired onChange — one misclick could tell a real
// customer their order was delivered or cancelled. This holds the pick in
// a confirmation dialog that says up front whether confirming will
// actually email them, instead of committing immediately. Only stages
// ahead of the current one (plus Cancelled) are ever offered — an order
// can't be pushed back to an earlier stage, enforced again server-side in
// updateOrderStatus so this isn't just a UI restriction.
//
// A genuine misclick is still possible even with the dialog, so a brief
// "Undo" follows every confirmed change — it reverts the order's status,
// and since the customer email itself is held for the same window
// server-side, a timely undo means the customer never hears about the
// mistake at all.
export function OrderStatusSelect({
  orderId,
  status,
  onConfirm,
}: {
  orderId: string;
  status: OrderStatus;
  onConfirm: (next: OrderStatus) => Promise<{ error?: string; eventId?: string }>;
}) {
  const router = useRouter();
  const [pending, setPending] = useState<OrderStatus | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [undo, setUndo] = useState<UndoState | null>(null);
  const [undoing, setUndoing] = useState(false);
  const [undoError, setUndoError] = useState("");

  const next = allowedNextStatuses(status);
  const reachable = new Set(next);
  const canCancel = reachable.has("Cancelled");

  useEffect(() => {
    if (!undo) return;
    const timeout = setTimeout(() => setUndo(null), UNDO_WINDOW_MS);
    return () => clearTimeout(timeout);
  }, [undo]);

  async function confirm() {
    if (!pending) return;
    const changingFrom = status;
    setSaving(true);
    setError("");
    try {
      const result = await onConfirm(pending);
      if (result.error) {
        setError(result.error);
        return;
      }
      if (result.eventId) {
        setUndo({ eventId: result.eventId, previousStatus: changingFrom, changedTo: pending });
      }
      setPending(null);
    } catch {
      // A thrown error (DB blip, etc.) shouldn't leave this stuck with no
      // way to retry or even see that it failed — the dialog stays open.
      setError("Couldn't save. Try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleUndo() {
    if (!undo) return;
    setUndoing(true);
    setUndoError("");
    try {
      const result = await undoOrderStatus(orderId, undo.eventId, undo.previousStatus);
      if (result.error) {
        setUndoError(result.error);
        return;
      }
      setUndo(null);
      router.refresh();
    } catch {
      setUndoError("Couldn't undo. Try again.");
    } finally {
      setUndoing(false);
    }
  }

  return (
    <>
      <div className="flex flex-col gap-1.5">
        {status === "Cancelled" ? (
          <Badge
            variant="outline"
            className="w-fit border-transparent bg-red-50 text-[10px] font-medium tracking-[0.06em] text-red-700 uppercase"
          >
            Cancelled
          </Badge>
        ) : (
          <>
            <FulfillmentSteps
              status={status}
              reachable={reachable}
              onPick={(nextStatus) => {
                setPending(nextStatus);
                setError("");
              }}
            />
            <p className="text-xs font-medium tracking-[0.06em] uppercase">{status}</p>
            {canCancel && (
              <button
                type="button"
                onClick={() => {
                  setPending("Cancelled");
                  setError("");
                }}
                className="text-left text-[10px] text-black/30 underline underline-offset-2 hover:text-red-600"
              >
                Cancel order
              </button>
            )}
          </>
        )}

        {undo && (
          <div className="flex items-center gap-1.5 text-[10px] text-black/40">
            <span>Changed to {undo.changedTo}.</span>
            <button
              type="button"
              onClick={handleUndo}
              disabled={undoing}
              className="font-medium text-black underline underline-offset-2 hover:text-black/70 disabled:opacity-50"
            >
              {undoing ? "Undoing..." : "Undo"}
            </button>
          </div>
        )}
        {undoError && <p className="text-[10px] text-red-600">{undoError}</p>}
      </div>

      <AlertDialog open={pending !== null} onOpenChange={(open) => !open && !saving && setPending(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change order status to {pending}?</AlertDialogTitle>
            <AlertDialogDescription>
              {pending && orderStatusChangeSendsEmail(pending)
                ? "The customer will get an email letting them know — you'll have a few seconds to undo first."
                : "The customer won't be notified about this change."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving} onClick={() => setPending(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={saving}
              onClick={(event) => {
                event.preventDefault();
                confirm();
              }}
            >
              {saving ? "Saving..." : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
