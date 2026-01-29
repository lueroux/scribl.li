import { useLingui } from '@lingui/react/macro';

import { PersonalBillingPlans } from '~/components/general/personal-billing-plans';
import { SettingsHeader } from '~/components/general/settings-header';
import { UserBillingOrganisationsTable } from '~/components/tables/user-billing-organisations-table';
import { appMetaTags } from '~/utils/meta';

export function meta() {
  return appMetaTags('Billing');
}

export default function SettingsBilling() {
  const { t } = useLingui();

  return (
    <div>
      <SettingsHeader
        title={t`Billing`}
        subtitle={t`Manage your personal plan and organisation subscriptions.`}
      />

      <div className="space-y-8">
        <PersonalBillingPlans />

        <div>
          <h2 className="mb-4 text-xl font-semibold">{t`Organisation Subscriptions`}</h2>
          <p className="mb-6 text-muted-foreground">
            {t`Manage billing and subscriptions for organisations where you have billing management permissions.`}
          </p>
          <UserBillingOrganisationsTable />
        </div>
      </div>
    </div>
  );
}
