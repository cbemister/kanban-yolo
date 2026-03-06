import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUserId, unauthorized, notFound } from "@/lib/auth-helpers";
import { broadcastToBoard } from "@/lib/broadcast";
import { logActivity } from "@/lib/activity";

const createSchema = z.object({
  boardId: z.string(),
  title: z.string().min(1).max(200),
});

export async function POST(req: NextRequest) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return unauthorized();

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const board = await prisma.board.findFirst({
    where: { id: parsed.data.boardId, userId },
  });
  if (!board) return notFound();

  const lastColumn = await prisma.column.findFirst({
    where: { boardId: parsed.data.boardId },
    orderBy: { position: "desc" },
    select: { position: true },
  });
  const position = (lastColumn?.position ?? -1) + 1;

  const column = await prisma.column.create({
    data: {
      title: parsed.data.title,
      boardId: parsed.data.boardId,
      position,
    },
  });

  await broadcastToBoard(parsed.data.boardId, "column:created", { columnId: column.id, boardId: parsed.data.boardId, userId });
  await logActivity(parsed.data.boardId, userId, "created column", { columnTitle: column.title });

  return NextResponse.json(column, { status: 201 });
}
