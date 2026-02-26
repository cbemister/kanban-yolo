import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkBoardPermission, getBoardIdFromCard } from "@/lib/permissions";
import { z } from "zod";

const createSchema = z.object({
  fileName: z.string(),
  fileUrl: z.string(),
  fileSize: z.number().int(),
  mimeType: z.string(),
});

export async function GET(request: Request, { params }: { params: Promise<{ cardId: string }> }) {
  const { cardId } = await params;
  const boardId = await getBoardIdFromCard(cardId);
  if (!boardId) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const perm = await checkBoardPermission(boardId, "VIEWER");
  if (!perm.authorized) return perm.response;
  const attachments = await prisma.attachment.findMany({
    where: { cardId },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(attachments);
}

export async function POST(request: Request, { params }: { params: Promise<{ cardId: string }> }) {
  const { cardId } = await params;
  const boardId = await getBoardIdFromCard(cardId);
  if (!boardId) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const perm = await checkBoardPermission(boardId, "EDITOR");
  if (!perm.authorized) return perm.response;
  const body = await request.json();
  const data = createSchema.parse(body);
  const attachment = await prisma.attachment.create({
    data: { ...data, cardId, userId: perm.userId },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
  return NextResponse.json(attachment, { status: 201 });
}
