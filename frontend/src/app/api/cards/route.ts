import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUserId, unauthorized, notFound } from "@/lib/auth-helpers";
import { broadcastToBoard } from "@/lib/broadcast";

const createSchema = z.object({
  columnId: z.string(),
  title: z.string().min(1).max(500),
  details: z.string().max(10000).optional().default(""),
});

export async function POST(req: NextRequest) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return unauthorized();

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const column = await prisma.column.findFirst({
    where: { id: parsed.data.columnId, board: { userId } },
  });
  if (!column) return notFound();

  const lastCard = await prisma.card.findFirst({
    where: { columnId: parsed.data.columnId },
    orderBy: { position: "desc" },
    select: { position: true },
  });
  const position = (lastCard?.position ?? -1) + 1;

  const card = await prisma.card.create({
    data: {
      title: parsed.data.title,
      details: parsed.data.details,
      columnId: parsed.data.columnId,
      position,
    },
  });

  await broadcastToBoard(column.boardId, "card:created", { cardId: card.id, boardId: column.boardId });

  return NextResponse.json(card, { status: 201 });
}
