# Lifetime Billing Setup Guide

This guide explains how to set up and configure lifetime billing plans for Scriblli.

## Overview

The lifetime billing feature allows users to make a one-time payment for perpetual access to a plan, instead of paying monthly or yearly. This feature has been added to the existing subscription billing system.

## Database Changes

A new field `billingType` has been added to the `Subscription` model to track whether a subscription is:
- `subscription` - Recurring monthly/yearly billing
- `lifetime` - One-time payment with perpetual access

Run the migration to add this field:
```bash
npx prisma migrate dev
```

**Important**: After applying the migration, regenerate the Prisma client:
```bash
npx prisma generate
```

The TypeScript code includes `@ts-ignore` comments for the `billingType` field to allow development before the migration is applied. These can be removed after the migration is applied and the client is regenerated.

## Stripe Setup

### 1. Run the Setup Script

After deploying the code changes, run the setup script to create lifetime prices for existing products:

```bash
npx ts-node scripts/setup-lifetime-plans.ts
```

This script will:
- Find existing products for Individual, Team, Platform, and Enterprise plans
- Create one-time prices for each product
- Mark the products as supporting lifetime billing

### 2. Verify in Stripe Dashboard

1. Go to your Stripe Dashboard
2. Navigate to Products
3. Check that each paid plan has both recurring and one-time prices
4. Verify the product metadata includes `billingType: lifetime`

### 3. Configure Webhooks

Ensure your Stripe webhook endpoint is configured to receive:
- `checkout.session.completed` - For lifetime payments
- `customer.subscription.created` - For recurring subscriptions
- `customer.subscription.updated` - For subscription changes
- `customer.subscription.deleted` - For cancellations

## How It Works

### Payment Flow

1. **User Selection**: Users can choose between Monthly, Yearly, or Lifetime billing
2. **Checkout Session**: 
   - For recurring plans: Creates a subscription checkout session
   - For lifetime plans: Creates a payment checkout session
3. **Webhook Processing**:
   - Recurring: `customer.subscription.created` webhook creates subscription record
   - Lifetime: `checkout.session.completed` webhook creates subscription record with `billingType: lifetime`

### Subscription Management

- **Recurring Plans**: Have `periodEnd` date and can be canceled
- **Lifetime Plans**: Have `periodEnd: null` and `billingType: lifetime`
- Both types are tracked in the same `Subscription` table

## Testing

### Test Lifetime Purchase

1. Go to the billing page
2. Select the "Lifetime" tab
3. Choose a plan and click "Subscribe"
4. Complete the test payment in Stripe
5. Verify the subscription is created with:
   - `status: ACTIVE`
   - `billingType: lifetime`
   - `periodEnd: null`

### Test Webhooks

Use the Stripe CLI to test webhooks:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Trigger events:
- For lifetime: `stripe trigger checkout.session.completed`
- For subscription: `stripe trigger customer.subscription.created`

## UI Changes

The billing plans component now includes:
- Three tabs: Monthly, Yearly, Lifetime
- Lifetime plans show "one-time payment" instead of "per month/year"
- Same checkout flow for all billing types

## Considerations

1. **Pricing Strategy**: Lifetime prices should typically be equivalent to 2-3 years of recurring payments
2. **Upgrades**: Users on lifetime plans cannot upgrade to higher tiers (would require new purchase)
3. **Downgrades**: Not applicable for lifetime plans
4. **Refunds**: Must be handled manually through Stripe dashboard for lifetime purchases

## Troubleshooting

### Lifetime plans not showing
- Check that products have `billingType: lifetime` in metadata
- Verify prices have `visibleInApp: true` in metadata
- Ensure the setup script has been run

### Webhook issues
- Check webhook endpoint is receiving `checkout.session.completed` events
- Verify payment intent metadata includes `billingType: lifetime`
- Check logs for webhook processing errors

### Subscription not created
- Verify the payment was successful
- Check webhook logs for errors
- Ensure the organization exists or is created properly

## Migration Notes

- Existing subscriptions are unaffected
- The `billingType` field defaults to `subscription` for backward compatibility
- No data migration is required for existing subscriptions
