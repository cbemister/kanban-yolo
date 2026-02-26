import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";

export async function logActivity(
  boardId: string,
  userId: string,
  action: string,
  metadata: Record<string, unknown> = {},
  cardId?: string
) {
  await prisma.activity.create({
    data: { boardId, userId, action, metadata: metadata as Prisma.InputJsonValue, cardId },
  });
}
