import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  getAuthenticatedUserId,
  unauthorized,
  notFound,
} from "@/lib/auth-helpers";

type Params = { params: Promise<{ cardId: string }> };

async function getCardForUser(cardId: string, userId: string) {
  return prisma.card.findFirst({
    where: { id: cardId, column: { board: { userId } } },
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

  const updated = await prisma.card.update({
    where: { id: cardId },
    data: parsed.data,
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return unauthorized();

  const { cardId } = await params;
  const card = await getCardForUser(cardId, userId);
  if (!card) return notFound();

  await prisma.card.delete({ where: { id: cardId } });

  return new NextResponse(null, { status: 204 });
}
