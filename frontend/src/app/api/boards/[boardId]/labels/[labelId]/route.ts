import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { checkBoardPermission } from "@/lib/permissions";

type Params = { params: Promise<{ boardId: string; labelId: string }> };

const patchSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  color: z.string().min(4).max(9).optional(),
});

export async function PATCH(req: NextRequest, { params }: Params) {
  const { boardId, labelId } = await params;
  const perm = await checkBoardPermission(boardId, "EDITOR");
  if (!perm.authorized) return perm.response;

  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const label = await prisma.label.update({
    where: { id: labelId },
    data: parsed.data,
  });

  return NextResponse.json(label);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { boardId, labelId } = await params;
  const perm = await checkBoardPermission(boardId, "EDITOR");
  if (!perm.authorized) return perm.response;

  await prisma.label.delete({ where: { id: labelId } });

  return new NextResponse(null, { status: 204 });
}
