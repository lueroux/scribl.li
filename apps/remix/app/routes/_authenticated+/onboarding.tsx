import { redirect } from 'react-router';

import { useSession } from '@documenso/lib/client-only/providers/session';

import { OnboardingPlanSelection } from '~/components/general/onboarding/onboarding-plan-selection';
import { appMetaTags } from '~/utils/meta';

export function meta() {
  return appMetaTags('Onboarding');
}

export default function OnboardingPage() {
  const { organisations } = useSession();

  // If user already has organisations or teams, skip onboarding
  if (organisations.length > 0 || organisations.some((org) => org.teams.length > 0)) {
    throw redirect('/');
  }

  return <OnboardingPlanSelection />;
}
