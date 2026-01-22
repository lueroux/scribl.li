import { SubscriptionStatus } from '@prisma/client';

import type { Stripe } from '@Scriblli/lib/server-only/stripe';
import { prisma } from '@Scriblli/prisma';

export type OnSubscriptionDeletedOptions = {
  subscription: Stripe.Subscription;
};

export const onSubscriptionDeleted = async ({ subscription }: OnSubscriptionDeletedOptions) => {
  await prisma.subscription.update({
    where: {
      planId: subscription.id,
    },
    data: {
      status: SubscriptionStatus.INACTIVE,
    },
  });
};
