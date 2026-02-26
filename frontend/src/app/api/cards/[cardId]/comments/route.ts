import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { checkBoardPermission, getBoardIdFromCard } from "@/lib/permissions";
import { broadcastToBoard } from "@/lib/broadcast";

type Params = { params: Promise<{ cardId: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { cardId } = await params;
  const boardId = await getBoardIdFromCard(cardId);
  if (!boardId) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const perm = await checkBoardPermission(boardId, "VIEWER");
  if (!perm.authorized) return perm.response;

  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor");
  const take = 20;

  const comments = await prisma.comment.findMany({
    where: { cardId },
    orderBy: { createdAt: "asc" },
    take: take + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
    },
  });

  const hasMore = comments.length > take;
  const items = hasMore ? comments.slice(0, take) : comments;
  const nextCursor = hasMore ? items[items.length - 1].id : null;

  return NextResponse.json({ items, nextCursor });
}

const createSchema = z.object({
  content: z.string().min(1).max(10000),
});

export async function POST(req: NextRequest, { params }: Params) {
  const { cardId } = await params;
  const boardId = await getBoardIdFromCard(cardId);
  if (!boardId) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const perm = await checkBoardPermission(boardId, "EDITOR");
  if (!perm.authorized) return perm.response;

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const comment = await prisma.comment.create({
    data: {
      content: parsed.data.content,
      cardId,
      userId: perm.userId,
    },
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
    },
  });

  await broadcastToBoard(boardId, "comment:created", { commentId: comment.id, cardId, boardId });

  return NextResponse.json(comment, { status: 201 });
}
