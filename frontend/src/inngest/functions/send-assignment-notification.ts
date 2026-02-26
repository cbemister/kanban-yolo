import { inngest } from "@/lib/inngest";
import { prisma } from "@/lib/prisma";

export const sendAssignmentNotification = inngest.createFunction(
  { id: "send-assignment-notification" },
  { event: "card/assigned" },
  async ({ event }) => {
    const { cardId, assigneeId, assignedById, boardId } = event.data as {
      cardId: string;
      assigneeId: string;
      assignedById: string;
      boardId: string;
    };
    if (assigneeId === assignedById) return;
    const [card, assigner] = await Promise.all([
      prisma.card.findUnique({ where: { id: cardId }, select: { title: true } }),
      prisma.user.findUnique({ where: { id: assignedById }, select: { name: true, email: true } }),
    ]);
    if (!card || !assigner) return;
    await prisma.notification.create({
      data: {
        userId: assigneeId,
        type: "assignment",
        title: "You were assigned to a card",
        body: `${assigner.name ?? assigner.email} assigned you to "${card.title}"`,
        linkUrl: `/boards/${boardId}`,
      },
    });
  }
);
