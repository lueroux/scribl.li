import { createOrganisation } from '@documenso/lib/server-only/organisation/create-organisation';
import type { Stripe } from '@documenso/lib/server-only/stripe';
import { stripe } from '@documenso/lib/server-only/stripe';
import type { INTERNAL_CLAIM_ID } from '@documenso/lib/types/subscription';
import { internalClaims } from '@documenso/lib/types/subscription';
import { prisma } from '@documenso/prisma';

type OnCheckoutSessionCompletedOptions = {
  session: Stripe.Checkout.Session;
};

export const onCheckoutSessionCompleted = async ({
  session,
}: OnCheckoutSessionCompletedOptions) => {
  if (session.mode === 'payment' && session.payment_intent) {
    // Handle lifetime payment
    const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent as string);

    if (paymentIntent.metadata?.billingType === 'lifetime') {
      const organisationId = paymentIntent.metadata?.organisationId;
      const organisationName = paymentIntent.metadata?.organisationName;
      const userId = paymentIntent.metadata?.userId;

      // Get the price details to determine the plan
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
      const price = lineItems.data[0]?.price;

      if (price && organisationName && userId) {
        const product = await stripe.products.retrieve(price.product as string);
        const claimId = product.metadata?.claimId as INTERNAL_CLAIM_ID | undefined;

        if (claimId) {
          const claim = internalClaims[claimId];

          if (organisationId) {
            // Update existing subscription record for lifetime access
            await prisma.subscription.upsert({
              where: {
                organisationId,
              },
              update: {
                status: 'ACTIVE',
                planId: claimId,
                priceId: price.id,
                periodEnd: null, // Lifetime subscriptions have no end date
                cancelAtPeriodEnd: false,
                customerId: session.customer as string,
                // @ts-expect-error - billingType field added in migration
                billingType: 'lifetime',
              },
              create: {
                organisationId,
                status: 'ACTIVE',
                planId: claimId,
                priceId: price.id,
                periodEnd: null, // Lifetime subscriptions have no end date
                cancelAtPeriodEnd: false,
                customerId: session.customer as string,
                // @ts-expect-error - billingType field added in migration
                billingType: 'lifetime',
              },
            });
          } else {
            // Create new organization for lifetime payment
            const organisation = await createOrganisation({
              userId: parseInt(userId),
              name: organisationName,
              type: 'ORGANISATION',
              claim,
              customerId: session.customer as string,
            });

            // Create subscription record
            await prisma.subscription.create({
              data: {
                organisationId: organisation.id,
                status: 'ACTIVE',
                planId: claimId,
                priceId: price.id,
                periodEnd: null, // Lifetime subscriptions have no end date
                cancelAtPeriodEnd: false,
                customerId: session.customer as string,
                // @ts-expect-error - billingType field added in migration
                billingType: 'lifetime',
              },
            });
          }
        }
      }
    }
  }
};
