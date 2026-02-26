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

  // Allow board members as well as owner
  const board = await prisma.board.findUnique({
    where: { id: boardId },
  });

  if (!board) return notFound();

  const isOwner = board.userId === userId;
  if (!isOwner) {
    const member = await prisma.boardMember.findUnique({
      where: { boardId_userId: { boardId, userId } },
    });
    if (!member) return notFound();
  }

  const fullBoard = await prisma.board.findUnique({
    where: { id: boardId },
    include: {
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
    },
  });

  if (!fullBoard) return notFound();

  return NextResponse.json({ ...fullBoard, ownerId: fullBoard.userId });
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
