import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkBoardPermission } from "@/lib/permissions";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1).max(100),
  filters: z.object({
    labelIds: z.array(z.string()),
    assigneeId: z.string().nullable(),
    dueSoon: z.boolean(),
    overdue: z.boolean(),
  }),
});

export async function GET(request: Request, { params }: { params: Promise<{ boardId: string }> }) {
  const { boardId } = await params;
  const perm = await checkBoardPermission(boardId, "VIEWER");
  if (!perm.authorized) return perm.response;
  const savedFilters = await prisma.savedFilter.findMany({
    where: { boardId, userId: perm.userId },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(savedFilters);
}

export async function POST(request: Request, { params }: { params: Promise<{ boardId: string }> }) {
  const { boardId } = await params;
  const perm = await checkBoardPermission(boardId, "EDITOR");
  if (!perm.authorized) return perm.response;
  const body = await request.json();
  const { name, filters } = createSchema.parse(body);
  const savedFilter = await prisma.savedFilter.create({
    data: { boardId, userId: perm.userId, name, filters },
  });
  return NextResponse.json(savedFilter, { status: 201 });
}
