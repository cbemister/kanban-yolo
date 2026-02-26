import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getAuthenticatedUserId, unauthorized } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({ returnUrl: z.string() });

export async function POST(request: Request) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return unauthorized();

  const { returnUrl } = schema.parse(await request.json());

  const sub = await prisma.subscription.findUnique({ where: { userId } });
  if (!sub) return NextResponse.json({ error: "No subscription" }, { status: 404 });

  const session = await stripe.billingPortal.sessions.create({
    customer: sub.stripeCustomerId,
    return_url: returnUrl,
  });

  return NextResponse.json({ url: session.url });
}
