import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUserId, unauthorized } from "@/lib/auth-helpers";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await getAuthenticatedUserId();
  if (!userId) return unauthorized();
  const notification = await prisma.notification.findUnique({ where: { id } });
  if (!notification || notification.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const updated = await prisma.notification.update({ where: { id }, data: { read: true } });
  return NextResponse.json(updated);
}
