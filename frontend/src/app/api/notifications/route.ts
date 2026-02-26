import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUserId, unauthorized } from "@/lib/auth-helpers";

export async function GET(request: Request) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return unauthorized();
  const { searchParams } = new URL(request.url);
  const unreadOnly = searchParams.get("unread") === "true";
  const notifications = await prisma.notification.findMany({
    where: { userId, ...(unreadOnly ? { read: false } : {}) },
    orderBy: { createdAt: "desc" },
    take: 30,
  });
  return NextResponse.json(notifications);
}
