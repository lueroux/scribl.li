import { getInternalClaimPlans } from '@documenso/ee/server-only/stripe/get-internal-claim-plans';
import { IS_BILLING_ENABLED } from '@documenso/lib/constants/app';
import { prisma } from '@documenso/prisma';

import { authenticatedProcedure } from '../trpc';

export const getPlansRoute = authenticatedProcedure.query(async ({ ctx }) => {
  const userId = ctx.user.id;

  try {
    const plans = await getInternalClaimPlans();

    let canCreateFreeOrganisation = false;

    if (IS_BILLING_ENABLED()) {
      const numberOfFreeOrganisations = await prisma.organisation.count({
        where: {
          ownerUserId: userId,
          subscription: {
            is: null,
          },
        },
      });

      canCreateFreeOrganisation = numberOfFreeOrganisations === 0;
    }

    return {
      plans,
      canCreateFreeOrganisation,
    };
  } catch (err) {
    // If Stripe is not configured or fails, return empty plans
    console.error('Failed to fetch billing plans:', err);

    // Return a minimal response with empty plans to prevent 500 errors
    return {
      plans: {},
      canCreateFreeOrganisation: false,
    };
  }
});
