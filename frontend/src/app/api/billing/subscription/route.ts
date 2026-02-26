import { NextResponse } from "next/server";
import { getAuthenticatedUserId, unauthorized } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const userId = await getAuthenticatedUserId();
  if (!userId) return unauthorized();

  const sub = await prisma.subscription.findUnique({
    where: { userId },
    select: { plan: true, status: true, currentPeriodEnd: true },
  });

  return NextResponse.json(sub ?? { plan: "free", status: "active", currentPeriodEnd: null });
}
