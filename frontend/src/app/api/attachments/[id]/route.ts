import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkBoardPermission, getBoardIdFromCard } from "@/lib/permissions";
import { deleteS3Object } from "@/lib/s3";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const attachment = await prisma.attachment.findUnique({ where: { id } });
  if (!attachment) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const boardId = await getBoardIdFromCard(attachment.cardId);
  if (!boardId) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const perm = await checkBoardPermission(boardId, "VIEWER");
  if (!perm.authorized) return perm.response;
  // Only owner of attachment or board OWNER can delete
  if (attachment.userId !== perm.userId && perm.role !== "OWNER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  // Extract S3 key from fileUrl
  const urlParts = attachment.fileUrl.split("/attachments/");
  if (urlParts.length > 1) {
    await deleteS3Object(`attachments/${urlParts[1]}`).catch(() => {});
  }
  await prisma.attachment.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
