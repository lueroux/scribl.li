import type Stripe from 'stripe';

import { AppError, AppErrorCode } from '@documenso/lib/errors/app-error';
import { stripe } from '@documenso/lib/server-only/stripe';

export type CreateCheckoutSessionOptions = {
  customerId: string;
  priceId: string;
  returnUrl: string;
  subscriptionMetadata?: Stripe.Metadata;
  mode?: 'subscription' | 'payment';
  paymentMetadata?: Stripe.Metadata;
};

export const createCheckoutSession = async ({
  customerId,
  priceId,
  returnUrl,
  subscriptionMetadata,
  mode = 'subscription',
  paymentMetadata,
}: CreateCheckoutSessionOptions) => {
  const sessionConfig: Stripe.Checkout.SessionCreateParams = {
    customer: customerId,
    mode,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${returnUrl}?success=true`,
    cancel_url: `${returnUrl}?canceled=true`,
  };

  if (mode === 'subscription') {
    sessionConfig.subscription_data = {
      metadata: subscriptionMetadata,
    };
  } else if (mode === 'payment') {
    sessionConfig.payment_intent_data = {
      metadata: paymentMetadata,
    };
  }

  const session = await stripe.checkout.sessions.create(sessionConfig);

  if (!session.url) {
    throw new AppError(AppErrorCode.UNKNOWN_ERROR, {
      message: 'Failed to create checkout session',
    });
  }

  return session.url;
};
