import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkBoardPermissionWithBoard } from "@/lib/permissions";

type Params = { params: Promise<{ boardId: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { boardId } = await params;
  const perm = await checkBoardPermissionWithBoard(boardId, "VIEWER");
  if (!perm.authorized) return perm.response;

  const [owner, members] = await Promise.all([
    prisma.user.findUnique({
      where: { id: perm.board.userId },
      select: { id: true, name: true, email: true, image: true },
    }),
    prisma.boardMember.findMany({
      where: { boardId },
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
      },
      orderBy: { joinedAt: "asc" },
    }),
  ]);

  const ownerEntry = {
    boardId,
    userId: perm.board.userId,
    role: "OWNER" as const,
    joinedAt: perm.board.createdAt.toISOString(),
    user: owner,
  };

  const memberEntries = members
    .filter((m) => m.userId !== perm.board.userId)
    .map((m) => ({ ...m, joinedAt: m.joinedAt.toISOString() }));

  return NextResponse.json([ownerEntry, ...memberEntries]);
}
