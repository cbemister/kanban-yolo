import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { checkBoardPermission } from "@/lib/permissions";

type Params = { params: Promise<{ boardId: string; userId: string }> };

const patchSchema = z.object({
  role: z.enum(["EDITOR", "VIEWER"]),
});

export async function PATCH(req: NextRequest, { params }: Params) {
  const { boardId, userId } = await params;
  const perm = await checkBoardPermission(boardId, "OWNER");
  if (!perm.authorized) return perm.response;

  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const member = await prisma.boardMember.update({
    where: { boardId_userId: { boardId, userId } },
    data: { role: parsed.data.role },
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
    },
  });

  return NextResponse.json(member);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { boardId, userId } = await params;
  const perm = await checkBoardPermission(boardId, "VIEWER");
  if (!perm.authorized) return perm.response;

  // OWNER can remove anyone; others can only remove themselves
  if (perm.role !== "OWNER" && perm.userId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.boardMember.delete({
    where: { boardId_userId: { boardId, userId } },
  });

  return new NextResponse(null, { status: 204 });
}
