import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { checkBoardPermission } from "@/lib/permissions";

type Params = { params: Promise<{ boardId: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { boardId } = await params;
  const perm = await checkBoardPermission(boardId, "VIEWER");
  if (!perm.authorized) return perm.response;

  const labels = await prisma.label.findMany({
    where: { boardId },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(labels);
}

const createSchema = z.object({
  name: z.string().min(1).max(100),
  color: z.string().min(4).max(9),
});

export async function POST(req: NextRequest, { params }: Params) {
  const { boardId } = await params;
  const perm = await checkBoardPermission(boardId, "EDITOR");
  if (!perm.authorized) return perm.response;

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const label = await prisma.label.create({
    data: { name: parsed.data.name, color: parsed.data.color, boardId },
  });

  return NextResponse.json(label, { status: 201 });
}
