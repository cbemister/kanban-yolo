import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import type Stripe from "stripe";

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "No signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET ?? "");
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const customerId = session.customer as string;
    const subscriptionId = session.subscription as string;
    const stripeSub = await stripe.subscriptions.retrieve(subscriptionId);
    const periodEnd = stripeSub.items.data[0]?.current_period_end ?? null;
    await prisma.subscription.updateMany({
      where: { stripeCustomerId: customerId },
      data: {
        stripeSubscriptionId: subscriptionId,
        plan: "pro",
        status: "active",
        currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
      },
    });
  }

  if (event.type === "customer.subscription.updated") {
    const stripeSub = event.data.object as Stripe.Subscription;
    const plan = stripeSub.status === "active" ? "pro" : "free";
    const periodEnd = stripeSub.items.data[0]?.current_period_end ?? null;
    await prisma.subscription.updateMany({
      where: { stripeCustomerId: stripeSub.customer as string },
      data: {
        plan,
        status: stripeSub.status,
        currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
      },
    });
  }

  if (event.type === "customer.subscription.deleted") {
    const stripeSub = event.data.object as Stripe.Subscription;
    await prisma.subscription.updateMany({
      where: { stripeCustomerId: stripeSub.customer as string },
      data: {
        plan: "free",
        status: "canceled",
        stripeSubscriptionId: null,
        currentPeriodEnd: null,
      },
    });
  }

  return NextResponse.json({ received: true });
}
