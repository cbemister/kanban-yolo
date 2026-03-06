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

type Params = { params: Promise<{ columnId: string }> };

async function getColumnForUser(columnId: string, userId: string) {
  return prisma.column.findFirst({
    where: { id: columnId, board: { userId } },
  });
}

const patchSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  position: z.number().int().min(0).optional(),
});

export async function PATCH(req: NextRequest, { params }: Params) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return unauthorized();

  const { columnId } = await params;
  const column = await getColumnForUser(columnId, userId);
  if (!column) return notFound();

  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const updated = await prisma.column.update({
    where: { id: columnId },
    data: parsed.data,
  });

  await broadcastToBoard(column.boardId, "column:updated", { columnId, boardId: column.boardId });

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return unauthorized();

  const { columnId } = await params;
  const column = await getColumnForUser(columnId, userId);
  if (!column) return notFound();

  await prisma.column.delete({ where: { id: columnId } });

  await Promise.all([
    broadcastToBoard(column.boardId, "column:deleted", { columnId, boardId: column.boardId }),
    logActivity(column.boardId, userId, "deleted column", { columnTitle: column.title }),
  ]);

  return new NextResponse(null, { status: 204 });
}
