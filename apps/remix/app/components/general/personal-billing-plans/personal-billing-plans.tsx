import { useMemo, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useLingui } from '@lingui/react/macro';
import { Trans } from '@lingui/react/macro';
import { motion } from 'framer-motion';
import { CreditCardIcon, Loader } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { useSession } from '@documenso/lib/client-only/providers/session';
import { INTERNAL_CLAIM_ID } from '@documenso/lib/types/subscription';
import { trpc } from '@documenso/trpc/react';
import { Button } from '@documenso/ui/primitives/button';
import { Card, CardContent, CardTitle } from '@documenso/ui/primitives/card';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@documenso/ui/primitives/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@documenso/ui/primitives/form/form';
import { Input } from '@documenso/ui/primitives/input';
import { Tabs, TabsList, TabsTrigger } from '@documenso/ui/primitives/tabs';
import { useToast } from '@documenso/ui/primitives/use-toast';

import { ZCreateOrganisationFormSchema } from '../../dialogs/organisation-create-dialog';

const MotionCard = motion.create(Card);

export const PersonalBillingPlans = () => {
  const { _ } = useLingui();
  const { organisations } = useSession();

  const [interval, setInterval] = useState<'monthlyPrice' | 'yearlyPrice' | 'lifetimePrice'>(
    'yearlyPrice',
  );

  const { data: plansQuery } = trpc.enterprise.billing.plans.get.useQuery();

  const plans = plansQuery?.plans || {};

  const pricesToDisplay = useMemo(() => {
    return Object.values(plans)
      .filter(
        (plan: Record<string, unknown>) =>
          plan[interval] && (plan[interval] as Record<string, unknown>).isVisibleInApp,
      )
      .map((plan: Record<string, unknown>) => ({
        ...(plan[interval] as Record<string, unknown>),
        memberCount: plan.memberCount as number,
        claim: plan.id as string,
      }));
  }, [plans, interval]);

  // Find personal organisation (type === 'PERSONAL')
  const personalOrganisation = organisations.find((org) => org.type === 'PERSONAL');

  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold">{_`Personal Plan`}</h2>
      <p className="mb-6 text-muted-foreground">
        {_`Manage your personal subscription plan. This plan applies to your personal workspace outside of any organisations.`}
      </p>

      {personalOrganisation ? (
        <PersonalCurrentPlan organisation={personalOrganisation} />
      ) : (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <CreditCardIcon className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 font-semibold">{_`No Personal Workspace`}</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {_`Create a personal workspace to start with your own plan.`}
          </p>
          <PersonalPlanSelection
            prices={pricesToDisplay}
            interval={interval}
            setInterval={setInterval}
          />
        </div>
      )}
    </div>
  );
};

const PersonalCurrentPlan = ({ organisation }: { organisation: Record<string, unknown> }) => {
  const { _ } = useLingui();

  const { data: subscriptionQuery, isLoading: isLoadingSubscription } =
    trpc.enterprise.billing.subscription.get.useQuery({
      organisationId: organisation.id,
    });

  if (isLoadingSubscription) {
    return (
      <div className="flex items-center justify-center rounded-lg py-8">
        <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const { subscription } = subscriptionQuery || {};

  if (!subscription) {
    return <PersonalPlanSelection plans={[]} interval="yearlyPrice" setInterval={() => {}} />;
  }

  const { organisationSubscription, stripeSubscription } = subscription;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">{organisationSubscription.planName}</h3>
            <p className="text-sm text-muted-foreground">
              {stripeSubscription?.status === 'active'
                ? _('Active')
                : stripeSubscription?.status === 'past_due'
                  ? _('Past Due')
                  : _('Canceled')}
            </p>
            {stripeSubscription?.current_period_end && (
              <p className="text-sm text-muted-foreground">
                {_`Renews on ${new Date(stripeSubscription.current_period_end * 1000).toLocaleDateString()}`}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href={`/o/${organisation.url}/settings/billing`}>{_`Manage`}</a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const PersonalPlanSelection = ({
  prices,
  interval,
  setInterval,
}: {
  prices: Record<string, unknown>[];
  interval: string;
  setInterval: (value: string) => void;
}) => {
  const { _ } = useLingui();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Record<string, unknown> | null>(null);

  const form = useForm({
    resolver: zodResolver(ZCreateOrganisationFormSchema),
    defaultValues: {
      name: _('Personal Workspace'),
    },
  });

  const { mutateAsync: createOrganisation, isPending: isCreatingOrganisation } =
    trpc.organisation.create.useMutation();

  const isPending = isCreatingOrganisation;

  const onSubscribeClick = (price: Record<string, unknown>) => {
    setSelectedPlan(price);
    setIsOpen(true);
  };

  const handleCreatePersonalWorkspace = async () => {
    if (!selectedPlan) return;

    try {
      let redirectUrl = '';

      if ((selectedPlan as Record<string, unknown>).claim === INTERNAL_CLAIM_ID.FREE) {
        // Create free personal organisation
        const createOrganisationResponse = await createOrganisation({
          name: form.getValues('name'),
          priceId: undefined,
        });

        if (!createOrganisationResponse.paymentRequired) {
          setIsOpen(false);
          window.location.reload();
        }
      } else {
        // Create organisation and subscribe
        const createOrganisationResponse = await createOrganisation({
          name: form.getValues('name'),
          priceId: (selectedPlan as Record<string, unknown>).id as string,
        });

        if (createOrganisationResponse.paymentRequired) {
          redirectUrl = createOrganisationResponse.checkoutUrl;
        } else {
          setIsOpen(false);
          window.location.reload();
        }
      }

      if (redirectUrl) {
        window.location.href = redirectUrl;
      }
    } catch (_err) {
      toast({
        title: _('Something went wrong'),
        description: _('An error occurred while creating your workspace.'),
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="mt-6">
      <Tabs value={interval} onValueChange={setInterval}>
        <TabsList>
          <TabsTrigger value="monthlyPrice">
            <Trans>Monthly</Trans>
          </TabsTrigger>
          <TabsTrigger value="yearlyPrice">
            <Trans>Yearly</Trans>
          </TabsTrigger>
          <TabsTrigger value="lifetimePrice">
            <Trans>Lifetime</Trans>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {prices.map((price) => (
          <MotionCard
            key={price.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.3 } }}
          >
            <CardContent className="flex h-full flex-col p-6">
              <CardTitle>{price.product.name}</CardTitle>

              <div className="mt-2 text-lg font-medium text-muted-foreground">
                {price.friendlyPrice + ' '}
                <span className="text-xs">
                  {interval === 'monthlyPrice' ? (
                    <Trans>per month</Trans>
                  ) : interval === 'yearlyPrice' ? (
                    <Trans>per year</Trans>
                  ) : (
                    <Trans>one-time payment</Trans>
                  )}
                </span>
              </div>

              <div className="mt-1.5 text-sm text-muted-foreground">
                {price.product.description}
              </div>

              <div className="flex-1" />

              <Button className="mt-4" onClick={() => onSubscribeClick(price)} disabled={isPending}>
                <Trans>Get Started</Trans>
              </Button>
            </CardContent>
          </MotionCard>
        ))}
      </div>

      <Dialog open={isOpen} onOpenChange={(value) => !isPending && setIsOpen(value)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              <Trans>Create Personal Workspace</Trans>
            </DialogTitle>
            <DialogDescription>
              <Trans>
                You're about to create a personal workspace with the {selectedPlan?.product.name}{' '}
                plan.
              </Trans>
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>
                    <Trans>Workspace Name</Trans>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Form>

          <DialogFooter>
            <DialogClose>
              <Button disabled={isPending} variant="secondary">
                <Trans>Cancel</Trans>
              </Button>
            </DialogClose>
            <Button loading={isPending} onClick={handleCreatePersonalWorkspace}>
              <Trans>Create Workspace</Trans>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
