import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUserId } from "@/lib/auth-helpers";

type Params = { params: Promise<{ token: string }> };

export async function POST(_req: NextRequest, { params }: Params) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { token } = await params;

  const invitation = await prisma.invitation.findUnique({ where: { token } });
  if (!invitation) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (invitation.status !== "PENDING") {
    return NextResponse.json({ error: "Invitation already used" }, { status: 400 });
  }

  await prisma.invitation.update({
    where: { id: invitation.id },
    data: { status: "DECLINED" },
  });

  return NextResponse.json({ ok: true });
}
