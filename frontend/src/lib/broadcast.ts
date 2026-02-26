import { pusherServer } from "./pusher-server";

export async function broadcastToBoard(boardId: string, event: string, data: unknown) {
  try {
    await pusherServer.trigger(`presence-board-${boardId}`, event, data);
  } catch {
    // Broadcast failure is non-fatal (placeholder keys won't work)
  }
}
