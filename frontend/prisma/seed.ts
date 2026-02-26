import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const COLUMNS = ["Backlog", "In Progress", "In Review", "Testing", "Done"];

const CARDS: { column: string; title: string; details: string }[] = [
  {
    column: "Backlog",
    title: "Design system audit",
    details:
      "Review all existing UI components and identify inconsistencies in spacing, color, and typography. Produce a report with recommendations for standardization across the product.",
  },
  {
    column: "Backlog",
    title: "Mobile responsive layout",
    details:
      "Refactor the main dashboard layout to be fully responsive on screens from 320px to 1440px wide. Ensure all interactive elements are touch-friendly with appropriate tap targets.",
  },
  {
    column: "Backlog",
    title: "Accessibility review",
    details:
      "Audit the application against WCAG 2.1 AA standards. Address issues with keyboard navigation, screen reader support, and color contrast across all primary user flows.",
  },
  {
    column: "In Progress",
    title: "User authentication flow",
    details:
      "Implement sign-up, login, and password reset flows using JWT-based authentication. Includes email verification and secure token storage on the client side.",
  },
  {
    column: "In Progress",
    title: "Dashboard analytics widget",
    details:
      "Build a summary widget displaying key project metrics including task completion rate, active members, and recent activity. Data should update in real time via polling.",
  },
  {
    column: "In Review",
    title: "API rate limiting",
    details:
      "Add rate limiting middleware to all public API endpoints to prevent abuse. Implement a sliding window algorithm with configurable limits per user and IP address.",
  },
  {
    column: "In Review",
    title: "Search functionality",
    details:
      "Implement full-text search across project cards and comments using a debounced input. Results should highlight matching terms and be filterable by column status.",
  },
  {
    column: "Testing",
    title: "Payment integration",
    details:
      "Integrate Stripe for subscription billing with support for monthly and annual plans. Requires end-to-end testing of checkout, webhook handling, and invoice generation.",
  },
  {
    column: "Done",
    title: "Project setup",
    details:
      "Initialized the Next.js repository with TypeScript, ESLint, and Tailwind CSS. Configured path aliases and established the base folder structure for the application.",
  },
  {
    column: "Done",
    title: "Database schema",
    details:
      "Designed and migrated the initial PostgreSQL schema covering users, projects, columns, and cards. Indexes added for all foreign keys and frequently queried columns.",
  },
  {
    column: "Done",
    title: "CI/CD pipeline",
    details:
      "Set up GitHub Actions workflows for linting, unit testing, and automated deployment to the staging environment on every merge to the main branch.",
  },
];

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const user = await prisma.user.upsert({
    where: { email: "demo@kanban.dev" },
    update: {},
    create: {
      name: "Demo User",
      email: "demo@kanban.dev",
      passwordHash,
    },
  });

  const board = await prisma.board.create({
    data: {
      title: "Demo Board",
      userId: user.id,
      columns: {
        create: COLUMNS.map((title, position) => ({ title, position })),
      },
    },
    include: { columns: true },
  });

  for (const colTitle of COLUMNS) {
    const column = board.columns.find((c) => c.title === colTitle)!;
    const colCards = CARDS.filter((c) => c.column === colTitle);

    for (let i = 0; i < colCards.length; i++) {
      await prisma.card.create({
        data: {
          title: colCards[i].title,
          details: colCards[i].details,
          columnId: column.id,
          position: i,
        },
      });
    }
  }

  console.log(`Seeded demo user: demo@kanban.dev / password123`);
  console.log(`Created board: ${board.title} (${board.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
