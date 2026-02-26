import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUserId, unauthorized, notFound, forbidden } from "@/lib/auth-helpers";
import { checkBoardPermission, getBoardIdFromCard } from "@/lib/permissions";
import { broadcastToBoard } from "@/lib/broadcast";

type Params = { params: Promise<{ commentId: string }> };

async function getComment(commentId: string) {
  return prisma.comment.findUnique({
    where: { id: commentId },
    include: { card: { include: { column: { select: { boardId: true } } } } },
  });
}

const patchSchema = z.object({
  content: z.string().min(1).max(10000),
});

export async function PATCH(req: NextRequest, { params }: Params) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return unauthorized();

  const { commentId } = await params;
  const comment = await getComment(commentId);
  if (!comment) return notFound();

  if (comment.userId !== userId) return forbidden();

  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const updated = await prisma.comment.update({
    where: { id: commentId },
    data: { content: parsed.data.content },
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
    },
  });

  const boardId = comment.card.column.boardId;
  await broadcastToBoard(boardId, "comment:updated", { commentId, cardId: comment.cardId, boardId });

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return unauthorized();

  const { commentId } = await params;
  const comment = await getComment(commentId);
  if (!comment) return notFound();

  const boardId = comment.card.column.boardId;

  if (comment.userId !== userId) {
    const perm = await checkBoardPermission(boardId, "OWNER");
    if (!perm.authorized) return forbidden();
  }

  await prisma.comment.delete({ where: { id: commentId } });

  await broadcastToBoard(boardId, "comment:deleted", { commentId, cardId: comment.cardId, boardId });

  return new NextResponse(null, { status: 204 });
}
