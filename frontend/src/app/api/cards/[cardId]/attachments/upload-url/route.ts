import { NextResponse } from "next/server";
import { checkBoardPermission, getBoardIdFromCard } from "@/lib/permissions";
import { getPresignedUploadUrl, getPublicUrl } from "@/lib/s3";
import { z } from "zod";

const ALLOWED_TYPES = [
  "image/jpeg", "image/png", "image/gif", "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain", "text/csv",
];
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

const schema = z.object({ fileName: z.string(), mimeType: z.string(), fileSize: z.number() });

export async function POST(request: Request, { params }: { params: Promise<{ cardId: string }> }) {
  const { cardId } = await params;
  const boardId = await getBoardIdFromCard(cardId);
  if (!boardId) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const perm = await checkBoardPermission(boardId, "EDITOR");
  if (!perm.authorized) return perm.response;
  const body = await request.json();
  const { fileName, mimeType, fileSize } = schema.parse(body);
  if (!ALLOWED_TYPES.includes(mimeType)) {
    return NextResponse.json({ error: "File type not allowed" }, { status: 400 });
  }
  if (fileSize > MAX_BYTES) {
    return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
  }
  const key = `attachments/${cardId}/${Date.now()}-${fileName}`;
  const uploadUrl = await getPresignedUploadUrl(key, mimeType);
  const publicUrl = getPublicUrl(key);
  return NextResponse.json({ uploadUrl, publicUrl, key });
}
