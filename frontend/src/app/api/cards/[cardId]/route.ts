import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  getAuthenticatedUserId,
  unauthorized,
  notFound,
} from "@/lib/auth-helpers";
import { broadcastToBoard } from "@/lib/broadcast";
import { logActivity } from "@/lib/activity";

type Params = { params: Promise<{ cardId: string }> };

async function getCardForUser(cardId: string, userId: string) {
  return prisma.card.findFirst({
    where: { id: cardId, column: { board: { userId } } },
    include: { column: { select: { boardId: true } } },
  });
}

export async function GET(_req: NextRequest, { params }: Params) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return unauthorized();

  const { cardId } = await params;
  const card = await getCardForUser(cardId, userId);
  if (!card) return notFound();

  return NextResponse.json(card);
}

const patchSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  details: z.string().max(10000).optional(),
  position: z.number().int().min(0).optional(),
  columnId: z.string().optional(),
  dueDate: z.string().datetime().nullish(),
});

export async function PATCH(req: NextRequest, { params }: Params) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return unauthorized();

  const { cardId } = await params;
  const card = await getCardForUser(cardId, userId);
  if (!card) return notFound();

  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { dueDate, ...rest } = parsed.data;
  const updateData: Record<string, unknown> = { ...rest };
  if (dueDate !== undefined) {
    updateData.dueDate = dueDate ? new Date(dueDate) : null;
  }

  const updated = await prisma.card.update({
    where: { id: cardId },
    data: updateData,
  });

  const boardId = card.column.boardId;
  await Promise.all([
    broadcastToBoard(boardId, "card:updated", { cardId, boardId }),
    logActivity(boardId, userId, "updated card", { cardTitle: updated.title }, cardId),
  ]);

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return unauthorized();

  const { cardId } = await params;
  const card = await getCardForUser(cardId, userId);
  if (!card) return notFound();

  const boardId = card.column.boardId;

  await prisma.card.delete({ where: { id: cardId } });

  await Promise.all([
    broadcastToBoard(boardId, "card:deleted", { cardId, boardId }),
    logActivity(boardId, userId, "deleted card", { cardTitle: card.title }),
  ]);

  return new NextResponse(null, { status: 204 });
}
