"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@luxe/database";
import { toPrismaOrderStatus, type OrderStatus } from "@/lib/order-status";

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
): Promise<{ error?: string }> {
  const prismaStatus = toPrismaOrderStatus(status);

  await prisma.$transaction([
    prisma.order.update({ where: { id: orderId }, data: { status: prismaStatus } }),
    prisma.orderStatusEvent.create({ data: { orderId, status: prismaStatus } }),
  ]);

  revalidatePath("/orders");
  return {};
}
