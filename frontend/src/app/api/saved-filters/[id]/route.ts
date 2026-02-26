import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUserId, unauthorized } from "@/lib/auth-helpers";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await getAuthenticatedUserId();
  if (!userId) return unauthorized();
  const filter = await prisma.savedFilter.findUnique({ where: { id } });
  if (!filter) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (filter.userId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  await prisma.savedFilter.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
