import { redirect } from 'react-router';

import { useSession } from '@documenso/lib/client-only/providers/session';

import { OnboardingPlanSelection } from '~/components/general/onboarding/onboarding-plan-selection';
import { appMetaTags } from '~/utils/meta';

export function meta() {
  return appMetaTags('Onboarding');
}

export default function OnboardingPage() {
  const { user, organisations } = useSession();

  // If user already has organisations or teams, skip onboarding
  if (organisations.length > 0 || organisations.some((org) => org.teams.length > 0)) {
    throw redirect('/');
  }

  // If email is not verified, show a message instead of onboarding
  if (!user.emailVerified) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Please verify your email</h1>
          <p className="mt-2 text-muted-foreground">
            Check your inbox for a verification email. You'll be able to access all features once
            verified.
          </p>
        </div>
      </div>
    );
  }

  return <OnboardingPlanSelection />;
}
