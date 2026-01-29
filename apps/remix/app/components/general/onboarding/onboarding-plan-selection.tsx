import { useState } from 'react';

import { Trans, useLingui } from '@lingui/react/macro';
import { ArrowRightIcon, CheckIcon, Loader } from 'lucide-react';
import { useNavigate } from 'react-router';

import { useAnalytics } from '@documenso/lib/client-only/hooks/use-analytics';
import { INTERNAL_CLAIM_ID } from '@documenso/lib/types/subscription';
import { trpc } from '@documenso/trpc/react';
import { Button } from '@documenso/ui/primitives/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@documenso/ui/primitives/card';
import { Tabs, TabsList, TabsTrigger } from '@documenso/ui/primitives/tabs';
import { useToast } from '@documenso/ui/primitives/use-toast';

export const OnboardingPlanSelection = () => {
  const { t } = useLingui();
  const { toast } = useToast();
  const navigate = useNavigate();
  const analytics = useAnalytics();

  const [interval, setInterval] = useState<'monthlyPrice' | 'yearlyPrice' | 'lifetimePrice'>(
    'yearlyPrice',
  );
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { data: plansQuery, error: plansError } = trpc.enterprise.billing.plans.get.useQuery();

  const { mutateAsync: createOrganisation } = trpc.organisation.create.useMutation();

  const plans = plansQuery?.plans || {};

  // Show error state if plans fail to load
  if (plansError) {
    return (
      <div className="mx-auto w-full max-w-screen-xl px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold md:text-4xl">
            <Trans>Choose Your Plan</Trans>
          </h1>
          <p className="mt-2 text-muted-foreground">
            <Trans>Something went wrong loading plans. Please refresh the page.</Trans>
          </p>
        </div>
        <div className="text-center">
          <Button onClick={() => window.location.reload()}>
            <Trans>Refresh Page</Trans>
          </Button>
        </div>
      </div>
    );
  }

  const pricesToDisplay = Object.values(plans)
    .filter(
      (plan: Record<string, unknown>) =>
        plan[interval] && (plan[interval] as Record<string, unknown>).isVisibleInApp,
    )
    .map((plan: Record<string, unknown>) => ({
      ...(plan[interval] as Record<string, unknown>),
      memberCount: plan.memberCount as number,
      claim: plan.id as string,
      planId: plan.id as string,
    }));

  const handlePlanSelect = async (priceId: string, planId: string) => {
    setSelectedPlan(planId);
    setIsLoading(true);

    try {
      void analytics.capture('Onboarding Plan Selected', {
        planId,
        interval,
      });

      // Create a free organisation first
      const createOrganisationResponse = await createOrganisation({
        name: t`My Workspace`,
        priceId: undefined, // Create free organisation first
      });

      if (planId === INTERNAL_CLAIM_ID.FREE) {
        // If free plan selected, go to dashboard
        void navigate('/');
        return;
      }

      // For paid plans, redirect to checkout
      if (createOrganisationResponse.paymentRequired) {
        window.location.href = createOrganisationResponse.checkoutUrl;
      } else {
        void navigate('/');
      }
    } catch (err) {
      toast({
        title: t`Something went wrong`,
        description: t`Failed to create your workspace. Please try again.`,
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  const handleSkipForNow = () => {
    void analytics.capture('Onboarding Skipped');
    void navigate('/');
  };

  return (
    <div className="mx-auto w-full max-w-screen-xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold md:text-4xl">
          <Trans>Choose Your Plan</Trans>
        </h1>
        <p className="mt-2 text-muted-foreground">
          <Trans>
            Start with a free workspace, or choose a plan that fits your needs. You can always
            change your plan later.
          </Trans>
        </p>
      </div>

      <Tabs
        value={interval}
        onValueChange={(value) =>
          setInterval(value as 'monthlyPrice' | 'yearlyPrice' | 'lifetimePrice')
        }
        className="mb-8"
      >
        <TabsList className="mx-auto w-fit">
          <TabsTrigger value="monthlyPrice">
            <Trans>Monthly</Trans>
          </TabsTrigger>
          <TabsTrigger value="yearlyPrice">
            <Trans>Yearly</Trans>
            <span className="ml-2 rounded bg-green-100 px-2 py-0.5 text-xs text-green-800 dark:bg-green-900 dark:text-green-200">
              <Trans>Save 20%</Trans>
            </span>
          </TabsTrigger>
          <TabsTrigger value="lifetimePrice">
            <Trans>Lifetime</Trans>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid gap-6 lg:grid-cols-3">
        {pricesToDisplay.map((price) => {
          const isPopular = price.claim === 'pro';
          const isSelected = selectedPlan === price.claim;

          return (
            <Card
              key={price.id}
              className={`relative ${isPopular ? 'border-scriblli ring-2 ring-scriblli/20' : ''} ${
                isSelected ? 'ring-2 ring-scriblli' : ''
              }`}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded bg-scriblli px-3 py-1 text-xs font-medium text-white">
                    <Trans>Most Popular</Trans>
                  </span>
                </div>
              )}

              <CardHeader className="text-center">
                <CardTitle className="text-xl">{price.product.name}</CardTitle>
                <CardDescription>{price.product.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{price.friendlyPrice}</span>
                  <span className="ml-2 text-muted-foreground">
                    {interval === 'monthlyPrice' ? (
                      <Trans>/month</Trans>
                    ) : interval === 'yearlyPrice' ? (
                      <Trans>/year</Trans>
                    ) : (
                      <Trans>/lifetime</Trans>
                    )}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="flex-1">
                {price.product.features && price.product.features.length > 0 && (
                  <ul className="space-y-3">
                    {price.product.features?.map((feature: { name: string }, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                        <span className="text-sm">{feature.name}</span>
                      </li>
                    ))}
                  </ul>
                )}

                <Button
                  className={`mt-6 w-full ${isPopular ? 'bg-scriblli hover:bg-scriblli/90' : ''}`}
                  variant={isSelected ? 'default' : isPopular ? 'default' : 'outline'}
                  onClick={async () => handlePlanSelect(price.id, price.claim)}
                  disabled={isLoading}
                  loading={isLoading && selectedPlan === price.claim}
                >
                  {isLoading && selectedPlan === price.claim ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      {price.claim === INTERNAL_CLAIM_ID.FREE ? (
                        <Trans>Start Free</Trans>
                      ) : (
                        <Trans>Get Started</Trans>
                      )}
                      <ArrowRightIcon className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-8 text-center">
        <button
          type="button"
          onClick={handleSkipForNow}
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          disabled={isLoading}
        >
          <Trans>Skip for now</Trans>
        </button>
      </div>
    </div>
  );
};
