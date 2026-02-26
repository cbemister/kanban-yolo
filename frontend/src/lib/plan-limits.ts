import { prisma } from "./prisma";

export const LIMITS = {
  free: { boards: 3, membersPerBoard: 2, attachments: false },
  pro: { boards: Infinity, membersPerBoard: Infinity, attachments: true },
} as const;

export type Plan = keyof typeof LIMITS;

export async function getUserPlan(userId: string): Promise<Plan> {
  const sub = await prisma.subscription.findUnique({ where: { userId } });
  if (sub?.plan === "pro" && sub.status === "active") return "pro";
  return "free";
}

export async function checkBoardLimit(userId: string): Promise<boolean> {
  const plan = await getUserPlan(userId);
  if (plan === "pro") return true;
  const count = await prisma.board.count({ where: { userId } });
  return count < LIMITS.free.boards;
}

export async function checkMemberLimit(boardId: string, userId: string): Promise<boolean> {
  const board = await prisma.board.findUnique({ where: { id: boardId } });
  if (!board) return false;
  const plan = await getUserPlan(board.userId);
  if (plan === "pro") return true;
  const count = await prisma.boardMember.count({ where: { boardId } });
  // +1 for owner (not in BoardMember table)
  return count + 1 < LIMITS.free.membersPerBoard;
}
