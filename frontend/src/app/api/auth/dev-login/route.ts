import { encode } from "next-auth/jwt";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  if (
    process.env.NODE_ENV === "production" ||
    process.env.DEV_SKIP_AUTH !== "true"
  ) {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }

  const userId = process.env.DEV_USER_ID;
  if (!userId) {
    return NextResponse.json({ error: "DEV_USER_ID not set" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const token = await encode({
    token: { id: user.id, name: user.name, email: user.email, sub: user.id },
    secret: process.env.AUTH_SECRET!,
    salt: "authjs.session-token",
  });

  const response = NextResponse.redirect(
    new URL("/boards", process.env.AUTH_URL || "http://localhost:3000")
  );
  response.cookies.set("authjs.session-token", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  return response;
}
