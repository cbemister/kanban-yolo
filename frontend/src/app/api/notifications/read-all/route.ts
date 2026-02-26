import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUserId, unauthorized } from "@/lib/auth-helpers";

export async function POST() {
  const userId = await getAuthenticatedUserId();
  if (!userId) return unauthorized();
  await prisma.notification.updateMany({ where: { userId, read: false }, data: { read: true } });
  return NextResponse.json({ ok: true });
}
