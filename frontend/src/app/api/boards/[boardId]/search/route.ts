import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkBoardPermission } from "@/lib/permissions";

type Params = { params: Promise<{ boardId: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { boardId } = await params;
  const perm = await checkBoardPermission(boardId, "VIEWER");
  if (!perm.authorized) return perm.response;

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  const labelId = searchParams.get("labelId");
  const assigneeId = searchParams.get("assigneeId");
  const dueBefore = searchParams.get("dueBefore");
  const dueAfter = searchParams.get("dueAfter");

  const cards = await prisma.card.findMany({
    where: {
      column: { boardId },
      ...(q ? { title: { contains: q, mode: "insensitive" } } : {}),
      ...(labelId ? { labels: { some: { labelId } } } : {}),
      ...(assigneeId ? { assignees: { some: { userId: assigneeId } } } : {}),
      ...(dueBefore || dueAfter ? {
        dueDate: {
          ...(dueBefore ? { lte: new Date(dueBefore) } : {}),
          ...(dueAfter ? { gte: new Date(dueAfter) } : {}),
        },
      } : {}),
    },
    include: {
      column: { select: { id: true, title: true } },
      labels: { include: { label: true } },
      assignees: {
        include: {
          user: { select: { id: true, name: true, email: true, image: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json(cards);
}
