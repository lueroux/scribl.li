import { Trans } from '@lingui/react/macro';

import { PipedriveIntegrationForm } from '~/components/forms/pipedrive-integration-form';

export default function TeamIntegrationsSettingsPage() {
  return (
    <div className="mx-auto w-full max-w-screen-xl px-4 md:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">
          <Trans>Integrations</Trans>
        </h1>
        <p className="text-muted-foreground">
          <Trans>Connect your team with external services to streamline your workflow.</Trans>
        </p>
      </div>

      <div className="space-y-8">
        {/* Pipedrive Integration Section */}
        <div className="rounded-lg border bg-card">
          <div className="border-b p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/20">
                {/* Pipedrive Logo - Simple P for now */}
                <span className="text-lg font-bold text-orange-600 dark:text-orange-400">P</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold">
                  <Trans>Pipedrive</Trans>
                </h2>
                <p className="text-sm text-muted-foreground">
                  <Trans>Automatically create activities when documents are signed</Trans>
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <PipedriveIntegrationForm />
          </div>
        </div>

        {/* Future Integrations Placeholder */}
        <div className="rounded-lg border border-dashed bg-muted/50 p-8 text-center">
          <div className="mx-auto max-w-md">
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              <Trans>More integrations coming soon</Trans>
            </h3>
            <p className="text-sm text-muted-foreground">
              <Trans>
                We're working on adding more integrations to help streamline your document workflow. 
                Have a specific integration request? Let us know!
              </Trans>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
