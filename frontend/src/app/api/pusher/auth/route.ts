import { NextRequest, NextResponse } from "next/server";
import { pusherServer } from "@/lib/pusher-server";
import { getAuthenticatedUserId } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.text();
  const params = new URLSearchParams(body);
  const socketId = params.get("socket_id");
  const channelName = params.get("channel_name");

  if (!socketId || !channelName) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  // Extract boardId from presence-board-{boardId}
  const match = channelName.match(/^presence-board-(.+)$/);
  if (match) {
    const boardId = match[1];
    const board = await prisma.board.findUnique({ where: { id: boardId } });
    if (!board) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    if (board.userId !== userId) {
      const member = await prisma.boardMember.findUnique({
        where: { boardId_userId: { boardId, userId } },
      });
      if (!member) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, image: true },
  });

  const presenceData = {
    user_id: userId,
    user_info: { name: user?.name ?? user?.email, image: user?.image },
  };

  const authResponse = pusherServer.authorizeChannel(socketId, channelName, presenceData);
  return NextResponse.json(authResponse);
}
