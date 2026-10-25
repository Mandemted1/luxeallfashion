"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { prisma } from "@luxe/database";
import { sendOrderStatusEmail } from "@/lib/order-emails";
import {
  allowedNextStatuses,
  fromPrismaOrderStatus,
  toPrismaOrderStatus,
  type OrderStatus,
} from "@/lib/order-status";
import { requireAction } from "@/lib/permissions";

// How long an admin has to undo a status change before the customer email
// actually goes out. Deliberately short — "catch an obvious misclick",
// not "freely reconsider later" — and comfortably inside a serverless
// function's default max duration, which `after()` below is bound by.
const UNDO_WINDOW_MS = 6000;

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
): Promise<{ error?: string; eventId?: string }> {
  const guard = await requireAction("ORDERS_UPDATE_STATUS");
  if (guard.error) return guard;

  const prismaStatus = toPrismaOrderStatus(status);

  const order = await prisma.order.findUniqueOrThrow({
    where: { id: orderId },
    include: { customer: true, items: { include: { product: true } } },
  });

  // Authoritative check — the UI already only offers valid forward steps,
  // but this is what actually stops an order being pushed backward (or a
  // final status being changed at all), regardless of what the client
  // sends.
  const currentStatus = fromPrismaOrderStatus(order.status);
  if (!allowedNextStatuses(currentStatus).includes(status)) {
    return { error: `Can't change from ${currentStatus} to ${status}.` };
  }

  const event = await prisma.$transaction(async (tx) => {
    await tx.order.update({ where: { id: orderId }, data: { status: prismaStatus } });
    return tx.orderStatusEvent.create({ data: { orderId, status: prismaStatus } });
  });

  // The DB write happens immediately — undoing within the window reverts
  // it, same as any other change, rather than this being "pending". Only
  // the customer email is actually delayed, since that's the part that
  // can't be taken back once it's sent. If undoOrderStatus deletes this
  // exact event before the window closes, the email is skipped entirely.
  after(async () => {
    await new Promise((resolve) => setTimeout(resolve, UNDO_WINDOW_MS));
    const stillPending = await prisma.orderStatusEvent.findUnique({ where: { id: event.id } });
    if (stillPending) {
      await sendOrderStatusEmail(order, prismaStatus);
    }
  });

  revalidatePath("/orders");
  return { eventId: event.id };
}

export async function undoOrderStatus(
  orderId: string,
  eventId: string,
  previousStatus: OrderStatus,
): Promise<{ error?: string }> {
  const guard = await requireAction("ORDERS_UNDO_STATUS");
  if (guard.error) return guard;

  // Only the single most recent event, and only within the window — the
  // UI only offers this for a few seconds right after a change, but this
  // is what actually enforces it regardless of what the client sends.
  const latestEvent = await prisma.orderStatusEvent.findFirst({
    where: { orderId },
    orderBy: { createdAt: "desc" },
  });
  if (!latestEvent || latestEvent.id !== eventId) {
    return { error: "This change can no longer be undone." };
  }
  if (Date.now() - latestEvent.createdAt.getTime() > UNDO_WINDOW_MS) {
    return { error: "This change can no longer be undone." };
  }

  await prisma.$transaction([
    prisma.order.update({
      where: { id: orderId },
      data: { status: toPrismaOrderStatus(previousStatus) },
    }),
    // Deleting it (rather than adding another event) is also the signal
    // the delayed email send in updateOrderStatus checks for — no event,
    // no email.
    prisma.orderStatusEvent.delete({ where: { id: eventId } }),
  ]);

  revalidatePath("/orders");
  return {};
}
