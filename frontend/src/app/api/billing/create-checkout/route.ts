import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getAuthenticatedUserId, unauthorized } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  priceId: z.string(),
  successUrl: z.string(),
  cancelUrl: z.string(),
});

export async function POST(request: Request) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return unauthorized();

  const body = await request.json();
  const { priceId, successUrl, cancelUrl } = schema.parse(body);

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  let sub = await prisma.subscription.findUnique({ where: { userId } });
  let customerId = sub?.stripeCustomerId;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name ?? undefined,
    });
    customerId = customer.id;
    if (sub) {
      await prisma.subscription.update({
        where: { userId },
        data: { stripeCustomerId: customerId },
      });
    } else {
      await prisma.subscription.create({
        data: { userId, stripeCustomerId: customerId },
      });
    }
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  return NextResponse.json({ url: session.url });
}
