import { inngest } from "@/lib/inngest";
import { prisma } from "@/lib/prisma";
import { addDays, startOfDay, endOfDay } from "date-fns";

export const sendDueDateReminders = inngest.createFunction(
  { id: "send-due-date-reminders" },
  { cron: "0 9 * * *" },
  async () => {
    const tomorrow = addDays(new Date(), 1);
    const start = startOfDay(tomorrow);
    const end = endOfDay(tomorrow);
    const cards = await prisma.card.findMany({
      where: { dueDate: { gte: start, lte: end } },
      include: {
        assignees: { include: { user: { select: { id: true } } } },
        column: { include: { board: { select: { id: true } } } },
      },
    });
    for (const card of cards) {
      for (const assignee of card.assignees) {
        await prisma.notification.create({
          data: {
            userId: assignee.user.id,
            type: "due_date_reminder",
            title: "Card due tomorrow",
            body: `"${card.title}" is due tomorrow`,
            linkUrl: `/boards/${card.column.board.id}`,
          },
        });
      }
    }
  }
);
