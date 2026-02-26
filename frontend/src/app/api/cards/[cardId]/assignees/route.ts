import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { checkBoardPermission, getBoardIdFromCard } from "@/lib/permissions";
import { inngest } from "@/lib/inngest";

type Params = { params: Promise<{ cardId: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { cardId } = await params;
  const boardId = await getBoardIdFromCard(cardId);
  if (!boardId) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const perm = await checkBoardPermission(boardId, "VIEWER");
  if (!perm.authorized) return perm.response;

  const assignees = await prisma.cardAssignee.findMany({
    where: { cardId },
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
    },
  });

  return NextResponse.json(assignees);
}

const bodySchema = z.object({ userId: z.string() });

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

  // Validate user is a board member or owner
  const board = await prisma.board.findUnique({ where: { id: boardId } });
  const isOwner = board?.userId === parsed.data.userId;
  if (!isOwner) {
    const member = await prisma.boardMember.findUnique({
      where: { boardId_userId: { boardId, userId: parsed.data.userId } },
    });
    if (!member) {
      return NextResponse.json({ error: "User is not a board member" }, { status: 400 });
    }
  }

  const assignee = await prisma.cardAssignee.create({
    data: { cardId, userId: parsed.data.userId },
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
    },
  });

  await inngest.send({
    name: "card/assigned",
    data: { cardId, assigneeId: parsed.data.userId, assignedById: perm.userId, boardId },
  }).catch(() => {}); // fire-and-forget, don't fail the request

  return NextResponse.json(assignee, { status: 201 });
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

  await prisma.cardAssignee.delete({
    where: { cardId_userId: { cardId, userId: parsed.data.userId } },
  });

  return new NextResponse(null, { status: 204 });
}
