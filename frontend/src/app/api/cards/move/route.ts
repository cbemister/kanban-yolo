import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUserId, unauthorized, notFound } from "@/lib/auth-helpers";
import { broadcastToBoard } from "@/lib/broadcast";
import { logActivity } from "@/lib/activity";

const moveSchema = z.object({
  cardId: z.string(),
  targetColumnId: z.string(),
  position: z.number().int().min(0),
});

export async function PUT(req: NextRequest) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return unauthorized();

  const body = await req.json();
  const parsed = moveSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { cardId, targetColumnId, position } = parsed.data;

  const card = await prisma.card.findFirst({
    where: { id: cardId, column: { board: { userId } } },
  });
  if (!card) return notFound();

  const targetColumn = await prisma.column.findFirst({
    where: { id: targetColumnId, board: { userId } },
  });
  if (!targetColumn) return notFound();

  const updated = await prisma.card.update({
    where: { id: cardId },
    data: { columnId: targetColumnId, position },
  });

  await Promise.all([
    broadcastToBoard(targetColumn.boardId, "card:moved", { cardId, boardId: targetColumn.boardId }),
    logActivity(
      targetColumn.boardId,
      userId,
      "moved card",
      { cardTitle: card.title, targetColumnTitle: targetColumn.title },
      cardId
    ),
  ]);

  return NextResponse.json(updated);
}
