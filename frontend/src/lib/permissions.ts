import { NextResponse } from "next/server";
import { getAuthenticatedUserId } from "./auth-helpers";
import { prisma } from "./prisma";

const roleHierarchy: Record<string, number> = { OWNER: 3, EDITOR: 2, VIEWER: 1 };

export async function checkBoardPermission(boardId: string, requiredRole: "OWNER" | "EDITOR" | "VIEWER") {
  const userId = await getAuthenticatedUserId();
  if (!userId) return { authorized: false as const, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };

  const board = await prisma.board.findUnique({ where: { id: boardId } });
  if (!board) return { authorized: false as const, response: NextResponse.json({ error: "Not found" }, { status: 404 }) };

  if (board.userId === userId) {
    return { authorized: true as const, userId, role: "OWNER" as const };
  }

  const member = await prisma.boardMember.findUnique({ where: { boardId_userId: { boardId, userId } } });
  if (!member) return { authorized: false as const, response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };

  if (roleHierarchy[member.role] < roleHierarchy[requiredRole]) {
    return { authorized: false as const, response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { authorized: true as const, userId, role: member.role };
}

export async function getBoardIdFromCard(cardId: string): Promise<string | null> {
  const card = await prisma.card.findUnique({
    where: { id: cardId },
    include: { column: { select: { boardId: true } } },
  });
  return card?.column?.boardId ?? null;
}
