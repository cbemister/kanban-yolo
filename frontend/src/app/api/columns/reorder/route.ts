import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUserId, unauthorized, notFound } from "@/lib/auth-helpers";

const reorderSchema = z.object({
  boardId: z.string(),
  columnIds: z.array(z.string()),
});

export async function PUT(req: NextRequest) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return unauthorized();

  const body = await req.json();
  const parsed = reorderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const board = await prisma.board.findFirst({
    where: { id: parsed.data.boardId, userId },
  });
  if (!board) return notFound();

  await prisma.$transaction(
    parsed.data.columnIds.map((id, position) =>
      prisma.column.update({ where: { id }, data: { position } })
    )
  );

  return new NextResponse(null, { status: 204 });
}
