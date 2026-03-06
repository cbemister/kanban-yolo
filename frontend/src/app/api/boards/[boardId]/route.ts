import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  getAuthenticatedUserId,
  unauthorized,
  notFound,
} from "@/lib/auth-helpers";

type Params = { params: Promise<{ boardId: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return unauthorized();

  const { boardId } = await params;

  const board = await prisma.board.findUnique({
    where: { id: boardId },
    include: {
      labels: { select: { id: true, name: true, color: true }, orderBy: { name: "asc" } },
      columns: {
        orderBy: { position: "asc" },
        include: {
          cards: {
            orderBy: { position: "asc" },
            include: {
              labels: { include: { label: true } },
              assignees: {
                include: {
                  user: { select: { id: true, name: true, email: true, image: true } },
                },
              },
            },
          },
        },
      },
      members: {
        where: { userId },
        select: { role: true },
        take: 1,
      },
    },
  });

  if (!board) return notFound();

  const isOwner = board.userId === userId;
  const isMember = board.members.length > 0;
  if (!isOwner && !isMember) return notFound();

  const { members: _members, ...boardData } = board;
  return NextResponse.json({ ...boardData, ownerId: board.userId });
}

const patchSchema = z.object({
  title: z.string().min(1).max(200),
});

export async function PATCH(req: NextRequest, { params }: Params) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return unauthorized();

  const { boardId } = await params;

  const board = await prisma.board.findFirst({ where: { id: boardId, userId } });
  if (!board) return notFound();

  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const updated = await prisma.board.update({
    where: { id: boardId },
    data: { title: parsed.data.title },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return unauthorized();

  const { boardId } = await params;

  const board = await prisma.board.findFirst({ where: { id: boardId, userId } });
  if (!board) return notFound();

  await prisma.board.delete({ where: { id: boardId } });

  return new NextResponse(null, { status: 204 });
}
