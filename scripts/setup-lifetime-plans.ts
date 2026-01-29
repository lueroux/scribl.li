import { stripe } from '../packages/lib/server-only/stripe';
import { INTERNAL_CLAIM_ID } from '../packages/lib/types/subscription';

/**
 * This script sets up lifetime pricing for existing products in Stripe.
 * Run this script after deploying the lifetime billing changes.
 *
 * Usage: npx ts-node scripts/setup-lifetime-plans.ts
 */

async function setupLifetimePlans() {
  console.log('Setting up lifetime plans...');

  // Define lifetime prices for each plan (in cents)
  const lifetimePrices = {
    [INTERNAL_CLAIM_ID.INDIVIDUAL]: 49900, // $499 one-time
    [INTERNAL_CLAIM_ID.TEAM]: 149900, // $1,499 one-time
    [INTERNAL_CLAIM_ID.PLATFORM]: 299900, // $2,999 one-time
    [INTERNAL_CLAIM_ID.ENTERPRISE]: 999900, // $9,999 one-time
  };

  try {
    // Get all active products
    const { data: products } = await stripe.products.search({
      query: `active:'true' AND metadata["claimId"]:'${INTERNAL_CLAIM_ID.INDIVIDUAL}' OR metadata["claimId"]:'${INTERNAL_CLAIM_ID.TEAM}' OR metadata["claimId"]:'${INTERNAL_CLAIM_ID.PLATFORM}' OR metadata["claimId"]:'${INTERNAL_CLAIM_ID.ENTERPRISE}'`,
      limit: 100,
    });

    for (const product of products) {
      const claimId = product.metadata.claimId as INTERNAL_CLAIM_ID;

      if (!claimId || !lifetimePrices[claimId]) {
        console.log(`Skipping product ${product.id} - no lifetime price defined`);
        continue;
      }

      // Check if lifetime price already exists
      const { data: existingPrices } = await stripe.prices.search({
        query: `product:'${product.id}' AND active:'true' AND type:'one_time'`,
        limit: 100,
      });

      if (existingPrices.length > 0) {
        console.log(`Lifetime price already exists for product ${product.id}`);
        continue;
      }

      // Create lifetime price
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: lifetimePrices[claimId],
        currency: 'usd',
        type: 'one_time',
        metadata: {
          visibleInApp: 'true',
        },
      });

      // Update product to mark it as having lifetime billing
      await stripe.products.update(product.id, {
        metadata: {
          ...product.metadata,
          billingType: 'lifetime',
        },
      });

      console.log(
        `Created lifetime price ${price.id} for product ${product.name} (${claimId}) - $${lifetimePrices[claimId] / 100}`,
      );
    }

    console.log('Lifetime plans setup complete!');
  } catch (error) {
    console.error('Error setting up lifetime plans:', error);
    process.exit(1);
  }
}

// Run the script
setupLifetimePlans();
