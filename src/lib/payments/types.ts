export type CheckoutSessionInput = {
  businessId: string;
  planId: string;
};

export type CheckoutSessionResult = {
  /** URL to redirect the business owner to. Null when the provider completes
   * the plan change synchronously (e.g. the dev stub, or a free plan). */
  url: string | null;
};

export interface PaymentProvider {
  name: string;
  startSubscriptionCheckout(input: CheckoutSessionInput): Promise<CheckoutSessionResult>;
}
