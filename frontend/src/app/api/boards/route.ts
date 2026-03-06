import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUserId, unauthorized } from "@/lib/auth-helpers";
import { getTemplateColumns } from "@/lib/board-templates";

export async function GET() {
  const userId = await getAuthenticatedUserId();
  if (!userId) return unauthorized();

  const boards = await prisma.board.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { columns: true } },
    },
  });

  return NextResponse.json(boards);
}

const createBoardSchema = z.object({
  title: z.string().min(1).max(200),
  templateId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return unauthorized();

  const body = await req.json();
  const parsed = createBoardSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const columns = getTemplateColumns(parsed.data.templateId ?? "sprint");

  const board = await prisma.board.create({
    data: {
      title: parsed.data.title,
      userId,
      columns: {
        create: columns.map((title, i) => ({ title, position: i })),
      },
    },
  });

  return NextResponse.json(board, { status: 201 });
}
