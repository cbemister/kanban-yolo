/**
 * Seed script for local dev user.
 * Run: npm run seed:dev  (from frontend/)
 *
 * Creates a richly-populated "Demo Board" for the dev user so every
 * feature (labels, assignees, due dates, comments, saved filters) can
 * be exercised without manual setup.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEV_USER_ID = "cmm3vldxl0000kb4g7q10rgk9";

function daysFromNow(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(0, 0, 0, 0);
  return d;
}

const TEAM = [
  { email: "james.dawson@kanban.dev", name: "James Dawson" },
  { email: "kai.lee@kanban.dev", name: "Kai Lee" },
  { email: "maya.reyes@kanban.dev", name: "Maya Reyes" },
];

const LABEL_DEFS = [
  { name: "Backend", color: "#209dd7" },
  { name: "Frontend", color: "#753991" },
  { name: "Design", color: "#ecad0a" },
  { name: "Research", color: "#888888" },
  { name: "Urgent", color: "#e53e3e" },
];

async function main() {
  const devUser = await prisma.user.findUnique({ where: { id: DEV_USER_ID } });
  if (!devUser) {
    console.error(`Dev user ${DEV_USER_ID} not found. Make sure you are connected to the right database.`);
    process.exit(1);
  }

  const existing = await prisma.board.findFirst({
    where: { title: "Demo Board", userId: DEV_USER_ID },
  });
  if (existing) {
    console.log(`Demo Board already exists for dev user — skipping.`);
    return;
  }

  const passwordHash = await bcrypt.hash("password123", 10);

  const [james, kai, maya] = await Promise.all(
    TEAM.map((t) =>
      prisma.user.upsert({
        where: { email: t.email },
        update: {},
        create: { name: t.name, email: t.email, passwordHash },
      })
    )
  );

  const board = await prisma.board.create({
    data: {
      title: "Demo Board",
      userId: DEV_USER_ID,
      columns: {
        create: [
          { title: "Backlog", position: 0 },
          { title: "In Progress", position: 1 },
          { title: "Review", position: 2 },
          { title: "Done", position: 3 },
        ],
      },
    },
    include: { columns: true },
  });

  const [labelBackend, labelFrontend, labelDesign, labelResearch, labelUrgent] =
    await Promise.all(
      LABEL_DEFS.map((l) =>
        prisma.label.create({ data: { ...l, boardId: board.id } })
      )
    );

  await Promise.all([
    prisma.boardMember.create({ data: { boardId: board.id, userId: james.id, role: "EDITOR" } }),
    prisma.boardMember.create({ data: { boardId: board.id, userId: kai.id, role: "EDITOR" } }),
    prisma.boardMember.create({ data: { boardId: board.id, userId: maya.id, role: "VIEWER" } }),
  ]);

  const col = (name: string) => board.columns.find((c) => c.title === name)!;

  const cardDefs = [
    // Backlog
    {
      title: "API documentation update",
      details:
        "Review and update all endpoint documentation to reflect recent schema changes and new query parameters. Ensure examples are accurate and response shapes are fully documented.",
      columnId: col("Backlog").id,
      position: 0,
      dueDate: daysFromNow(8),
      labelIds: [labelBackend.id],
      assigneeId: james.id,
    },
    {
      title: "Analytics dashboard research",
      details:
        "Investigate analytics libraries and dashboard layout patterns for the upcoming metrics feature. Produce a comparison of Recharts, Nivo, and Chart.js with a recommendation.",
      columnId: col("Backlog").id,
      position: 1,
      dueDate: daysFromNow(14),
      labelIds: [labelResearch.id],
      assigneeId: kai.id,
    },
    {
      title: "Redesign onboarding flow",
      details:
        "Map current user drop-off points and design a streamlined three-step onboarding experience with progressive disclosure and contextual tooltips. Deliver annotated wireframes.",
      columnId: col("Backlog").id,
      position: 2,
      dueDate: daysFromNow(-2),
      labelIds: [labelDesign.id, labelFrontend.id],
      assigneeId: maya.id,
    },
    {
      title: "Dark mode refinements",
      details:
        "Adjust contrast ratios, border colors, and shadow opacity values in dark mode for improved readability across all primary views.",
      columnId: col("Backlog").id,
      position: 3,
      dueDate: daysFromNow(12),
      labelIds: [labelFrontend.id],
      assigneeId: kai.id,
    },
    // In Progress
    {
      title: "Payment integration testing",
      details:
        "End-to-end testing of the Stripe payment pipeline including checkout flow, subscription lifecycle management, webhook reliability, and edge cases around failed charges, refunds, and plan downgrades. Must verify PCI compliance before launch.",
      columnId: col("In Progress").id,
      position: 0,
      dueDate: daysFromNow(-10),
      labelIds: [labelUrgent.id, labelBackend.id],
      assigneeId: james.id,
    },
    {
      title: "Notification preferences",
      details:
        "Build the notification preferences UI with toggles for email, push, and in-app notification channels. Persist selections via PATCH /api/users/me.",
      columnId: col("In Progress").id,
      position: 1,
      dueDate: daysFromNow(2),
      labelIds: [labelFrontend.id],
      assigneeId: kai.id,
    },
    {
      title: "Database query optimization",
      details:
        "Profile slow queries on the board and card listing endpoints. Add missing indexes and resolve N+1 patterns identified in the activity feed and assignee lookups.",
      columnId: col("In Progress").id,
      position: 2,
      dueDate: daysFromNow(6),
      labelIds: [labelBackend.id],
      assigneeId: james.id,
    },
    {
      title: "Mobile navigation redesign",
      details:
        "Rethink the bottom navigation pattern for mobile viewports. Current implementation causes thumb-reach issues on larger devices. Evaluate gesture-based navigation and swipe-to-switch patterns.",
      columnId: col("In Progress").id,
      position: 3,
      dueDate: daysFromNow(4),
      labelIds: [labelDesign.id, labelFrontend.id],
      assigneeId: maya.id,
    },
    // Review
    {
      title: "User profile settings page",
      details:
        "Complete implementation of the settings page with avatar upload, name and email editing, theme preferences, and notification toggles. Needs final design review before merging.",
      columnId: col("Review").id,
      position: 0,
      dueDate: daysFromNow(-8),
      labelIds: [labelFrontend.id, labelDesign.id],
      assigneeId: kai.id,
    },
    {
      title: "CSV export functionality",
      details:
        "Implement server-side CSV generation for board data export with configurable column selection. Add a download button to the board toolbar.",
      columnId: col("Review").id,
      position: 1,
      dueDate: daysFromNow(-5),
      labelIds: [labelBackend.id],
      assigneeId: james.id,
    },
    // Done
    {
      title: "OAuth2 integration",
      details:
        "Google OAuth2 provider integration with automatic account linking for existing email users. Tested sign-in, new account creation, and token refresh flows.",
      columnId: col("Done").id,
      position: 0,
      dueDate: daysFromNow(-14),
      labelIds: [labelBackend.id, labelFrontend.id],
      assigneeId: james.id,
    },
  ];

  for (const def of cardDefs) {
    const { labelIds, assigneeId, ...cardData } = def;
    const card = await prisma.card.create({
      data: {
        ...cardData,
        labels: { create: labelIds.map((labelId) => ({ labelId })) },
        assignees: { create: [{ userId: assigneeId }] },
      },
    });

    if (def.title === "Payment integration testing") {
      await prisma.comment.createMany({
        data: [
          {
            cardId: card.id,
            userId: james.id,
            content:
              "Webhook retry logic is failing on the third attempt. Investigating the idempotency key handling.",
          },
          {
            cardId: card.id,
            userId: kai.id,
            content:
              "I can reproduce it locally. Looks like the event deduplication window is too narrow. Will push a fix today.",
          },
        ],
      });
    }

    if (def.title === "User profile settings page") {
      await prisma.comment.create({
        data: {
          cardId: card.id,
          userId: maya.id,
          content:
            "Avatar upload looks good on desktop. Mobile crop UI needs adjusting — the modal overflows on 375px screens.",
        },
      });
    }

    if (def.title === "OAuth2 integration") {
      await prisma.comment.create({
        data: {
          cardId: card.id,
          userId: james.id,
          content:
            "Shipped and verified in staging. Account linking works for both new and returning users.",
        },
      });
    }
  }

  await prisma.savedFilter.create({
    data: {
      boardId: board.id,
      userId: DEV_USER_ID,
      name: "Overdue",
      filters: { labelIds: [], assigneeId: null, dueSoon: false, overdue: true },
    },
  });

  console.log(`Created Demo Board (${board.id}) for dev user ${DEV_USER_ID}`);
  console.log("Team: james.dawson@kanban.dev, kai.lee@kanban.dev, maya.reyes@kanban.dev (all: password123)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
