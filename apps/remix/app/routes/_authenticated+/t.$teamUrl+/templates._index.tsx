import { Trans, _ } from '@lingui/react/macro';
import { EnvelopeType } from '@prisma/client';
import { Cherry } from 'lucide-react';
import { useParams, useSearchParams } from 'react-router';

import { FolderType } from '@documenso/lib/types/folder-type';
import { formatAvatarUrl } from '@documenso/lib/utils/avatars';
import { formatDocumentsPath, formatTemplatesPath } from '@documenso/lib/utils/teams';
import { trpc } from '@documenso/trpc/react';
import { Avatar, AvatarFallback, AvatarImage } from '@documenso/ui/primitives/avatar';

import { EnvelopeDropZoneWrapper } from '~/components/general/envelope/envelope-drop-zone-wrapper';
import { FolderGrid } from '~/components/general/folder/folder-grid';
import { UpgradeBanner } from '~/components/general/upgrade-banner';
import { TemplatesTable } from '~/components/tables/templates-table';
import { useCurrentTeam } from '~/providers/team';
import { appMetaTags } from '~/utils/meta';

export function meta() {
  return appMetaTags('Templates');
}

export default function TemplatesPage() {
  const team = useCurrentTeam();

  const { folderId } = useParams();
  const [searchParams] = useSearchParams();

  const page = Number(searchParams.get('page')) || 1;
  const perPage = Number(searchParams.get('perPage')) || 10;

  const documentRootPath = formatDocumentsPath(team.url);
  const templateRootPath = formatTemplatesPath(team.url);

  const { data, isLoading, isLoadingError } = trpc.template.findTemplates.useQuery({
    page: page,
    perPage: perPage,
    folderId,
  });

  const { data: statsQuery } = trpc.document.getStats.useQuery({
    teamId: team.id,
  });

  return (
    <EnvelopeDropZoneWrapper type={EnvelopeType.TEMPLATE}>
      <div className="mx-auto max-w-screen-xl px-4 md:px-8">
        <FolderGrid type={FolderType.TEMPLATE} parentId={folderId ?? null} />

        {statsQuery?.stats && statsQuery.stats.quota && statsQuery.stats.remaining && (
          <div className="mt-6">
            {statsQuery.stats.remaining.templates <= 2 &&
              statsQuery.stats.remaining.templates > 0 && (
                <UpgradeBanner
                  title={_`Running out of templates`}
                  description={_`You have ${statsQuery.stats.remaining.templates} templates left in your monthly quota. Upgrade your plan to create more templates.`}
                  limitType="templates"
                  currentUsage={
                    statsQuery.stats.quota.templates - statsQuery.stats.remaining.templates
                  }
                  limit={statsQuery.stats.quota.templates}
                  variant="warning"
                />
              )}
            {statsQuery.stats.remaining.templates === 0 && (
              <UpgradeBanner
                title={_`Template limit reached`}
                description={_`You've reached your monthly template limit. Upgrade your plan to create more templates.`}
                limitType="templates"
                currentUsage={statsQuery.stats.quota.templates}
                limit={statsQuery.stats.quota.templates}
              />
            )}
          </div>
        )}

        <div className="mt-8">
          <div className="flex flex-row items-center">
            <Avatar className="mr-3 h-12 w-12 border-2 border-solid border-white dark:border-border">
              {team.avatarImageId && <AvatarImage src={formatAvatarUrl(team.avatarImageId)} />}
              <AvatarFallback className="text-xs text-muted-foreground">
                {team.name.slice(0, 1)}
              </AvatarFallback>
            </Avatar>

            <h1 className="truncate text-2xl font-semibold md:text-3xl">
              <Trans>Templates</Trans>
            </h1>
          </div>

          <div className="mt-8">
            {data && data.count === 0 ? (
              <div className="flex h-96 flex-col items-center justify-center gap-y-4 text-muted-foreground/60">
                <Cherry className="h-12 w-12" strokeWidth={1.5} />

                <div className="text-center">
                  <h3 className="text-lg font-semibold">
                    <Trans>We're all empty</Trans>
                  </h3>

                  <p className="mt-2 max-w-[50ch]">
                    <Trans>
                      You have not yet created any templates. To create a template please upload
                      one.
                    </Trans>
                  </p>
                </div>
              </div>
            ) : (
              <TemplatesTable
                data={data}
                isLoading={isLoading}
                isLoadingError={isLoadingError}
                documentRootPath={documentRootPath}
                templateRootPath={templateRootPath}
              />
            )}
          </div>
        </div>
      </div>
    </EnvelopeDropZoneWrapper>
  );
}
