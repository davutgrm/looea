import { prisma } from "@/lib/prisma";
import type { PaymentProvider } from "./types";

/** Development-mode provider: activates the plan change immediately without
 * a real payment step. Swap `getPaymentProvider()` to a Stripe-backed
 * implementation of the same interface when going live (STRIPE_SECRET_KEY). */
export const stubProvider: PaymentProvider = {
  name: "stub",

  async startSubscriptionCheckout({ businessId, planId }) {
    const plan = await prisma.subscriptionPlan.findUniqueOrThrow({ where: { id: planId } });

    const subscription = await prisma.subscription.upsert({
      where: { businessId },
      update: { planId, status: "ACTIVE", currentPeriodStart: new Date(), cancelAtPeriodEnd: false },
      create: { businessId, planId, status: "ACTIVE" },
    });

    await prisma.payment.create({
      data: {
        subscriptionId: subscription.id,
        amount: plan.price,
        status: "SUCCEEDED",
        provider: "stub",
      },
    });

    return { url: null };
  },
};
