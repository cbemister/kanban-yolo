import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { checkBoardPermission, getBoardIdFromCard } from "@/lib/permissions";

type Params = { params: Promise<{ cardId: string }> };

const bodySchema = z.object({ labelId: z.string() });

export async function POST(req: NextRequest, { params }: Params) {
  const { cardId } = await params;
  const boardId = await getBoardIdFromCard(cardId);
  if (!boardId) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const perm = await checkBoardPermission(boardId, "EDITOR");
  if (!perm.authorized) return perm.response;

  const body = await req.json();
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const cardLabel = await prisma.cardLabel.create({
    data: { cardId, labelId: parsed.data.labelId },
    include: { label: true },
  });

  return NextResponse.json(cardLabel, { status: 201 });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { cardId } = await params;
  const boardId = await getBoardIdFromCard(cardId);
  if (!boardId) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const perm = await checkBoardPermission(boardId, "EDITOR");
  if (!perm.authorized) return perm.response;

  const body = await req.json();
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  await prisma.cardLabel.delete({
    where: { cardId_labelId: { cardId, labelId: parsed.data.labelId } },
  });

  return new NextResponse(null, { status: 204 });
}
