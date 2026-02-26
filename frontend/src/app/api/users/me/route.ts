import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUserId, unauthorized } from "@/lib/auth-helpers";
import { z } from "zod";

const schema = z.object({ theme: z.string() });

export async function PATCH(request: Request) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return unauthorized();
  const body = await request.json();
  const { theme } = schema.parse(body);
  const user = await prisma.user.update({ where: { id: userId }, data: { theme } });
  return NextResponse.json({ theme: user.theme });
}
