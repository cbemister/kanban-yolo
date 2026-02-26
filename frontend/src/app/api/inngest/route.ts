import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest";
import { sendAssignmentNotification } from "@/inngest/functions/send-assignment-notification";
import { sendDueDateReminders } from "@/inngest/functions/send-due-date-reminders";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [sendAssignmentNotification, sendDueDateReminders],
});
