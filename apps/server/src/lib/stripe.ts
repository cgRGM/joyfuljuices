import { env } from "@joyfuljuices/env/server";
import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export const getStripe = () => {
  if (stripeClient) {
    return stripeClient;
  }

  stripeClient = new Stripe(env.STRIPE_SECRET_KEY, {
    httpClient: Stripe.createFetchHttpClient(),
  });

  return stripeClient;
};
