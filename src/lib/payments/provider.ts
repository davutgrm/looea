import { stubProvider } from "./stub-provider";
import type { PaymentProvider } from "./types";

export function getPaymentProvider(): PaymentProvider {
  // When STRIPE_SECRET_KEY is configured, return a Stripe-backed
  // implementation of PaymentProvider here instead of the stub.
  return stubProvider;
}
