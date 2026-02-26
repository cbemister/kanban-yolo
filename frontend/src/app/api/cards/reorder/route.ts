import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUserId, unauthorized, notFound } from "@/lib/auth-helpers";

const reorderSchema = z.object({
  columnId: z.string(),
  cardIds: z.array(z.string()),
});

export async function PUT(req: NextRequest) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return unauthorized();

  const body = await req.json();
  const parsed = reorderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const column = await prisma.column.findFirst({
    where: { id: parsed.data.columnId, board: { userId } },
  });
  if (!column) return notFound();

  await prisma.$transaction(
    parsed.data.cardIds.map((id, position) =>
      prisma.card.update({ where: { id }, data: { position } })
    )
  );

  return new NextResponse(null, { status: 204 });
}
