import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkBoardPermission } from "@/lib/permissions";

type Params = { params: Promise<{ boardId: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { boardId } = await params;
  const perm = await checkBoardPermission(boardId, "VIEWER");
  if (!perm.authorized) return perm.response;

  const board = await prisma.board.findUnique({
    where: { id: boardId },
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
      members: {
        include: {
          user: { select: { id: true, name: true, email: true, image: true } },
        },
        orderBy: { joinedAt: "asc" },
      },
    },
  });

  if (!board) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Include the board owner as an OWNER member
  const ownerEntry = {
    boardId,
    userId: board.user.id,
    role: "OWNER" as const,
    joinedAt: board.createdAt.toISOString(),
    user: board.user,
  };

  const memberEntries = board.members
    .filter((m) => m.userId !== board.userId)
    .map((m) => ({ ...m, joinedAt: m.joinedAt.toISOString() }));

  return NextResponse.json([ownerEntry, ...memberEntries]);
}
