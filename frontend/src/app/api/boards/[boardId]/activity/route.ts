import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkBoardPermission } from "@/lib/permissions";

type Params = { params: Promise<{ boardId: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { boardId } = await params;
  const perm = await checkBoardPermission(boardId, "VIEWER");
  if (!perm.authorized) return perm.response;

  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor");
  const take = 20;

  const activities = await prisma.activity.findMany({
    where: { boardId },
    orderBy: { createdAt: "desc" },
    take: take + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
    },
  });

  const hasMore = activities.length > take;
  const items = hasMore ? activities.slice(0, take) : activities;
  const nextCursor = hasMore ? items[items.length - 1].id : null;

  return NextResponse.json({ items, nextCursor });
}
