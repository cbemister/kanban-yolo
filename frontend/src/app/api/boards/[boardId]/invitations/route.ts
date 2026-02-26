import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { checkBoardPermission } from "@/lib/permissions";
import { sendBoardInvitationEmail } from "@/lib/email";

type Params = { params: Promise<{ boardId: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { boardId } = await params;
  const perm = await checkBoardPermission(boardId, "OWNER");
  if (!perm.authorized) return perm.response;

  const invitations = await prisma.invitation.findMany({
    where: { boardId, status: "PENDING" },
    orderBy: { expiresAt: "asc" },
  });

  return NextResponse.json(invitations);
}

const createSchema = z.object({
  email: z.string().email(),
  role: z.enum(["EDITOR", "VIEWER"]),
});

export async function POST(req: NextRequest, { params }: Params) {
  const { boardId } = await params;
  const perm = await checkBoardPermission(boardId, "OWNER");
  if (!perm.authorized) return perm.response;

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const board = await prisma.board.findUnique({
    where: { id: boardId },
    include: { user: { select: { name: true, email: true } } },
  });
  if (!board) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  // Check for existing user
  const existingUser = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });

  const invitation = await prisma.invitation.create({
    data: {
      boardId,
      email: parsed.data.email,
      role: parsed.data.role,
      invitedById: perm.userId,
      userId: existingUser?.id ?? null,
      expiresAt,
    },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const acceptUrl = `${appUrl}/invitations/${invitation.token}`;
  const inviterName = board.user.name ?? board.user.email;

  try {
    await sendBoardInvitationEmail({
      to: parsed.data.email,
      inviterName,
      boardName: board.title,
      role: parsed.data.role,
      acceptUrl,
    });
  } catch {
    // Email failure is non-fatal
  }

  return NextResponse.json(invitation, { status: 201 });
}

const deleteSchema = z.object({ invitationId: z.string() });

export async function DELETE(req: NextRequest, { params }: Params) {
  const { boardId } = await params;
  const perm = await checkBoardPermission(boardId, "OWNER");
  if (!perm.authorized) return perm.response;

  const body = await req.json();
  const parsed = deleteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  await prisma.invitation.delete({
    where: { id: parsed.data.invitationId },
  });

  return new NextResponse(null, { status: 204 });
}
