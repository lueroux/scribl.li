import { useState } from 'react';

import { Trans, useLingui } from '@lingui/react/macro';
import { XIcon } from 'lucide-react';
import { Link } from 'react-router';

import { Button } from '@documenso/ui/primitives/button';

interface UpgradeBannerProps {
  title: string;
  description: string;
  limitType?: 'documents' | 'templates' | 'members' | 'teams';
  currentUsage?: number;
  limit?: number;
  variant?: 'default' | 'warning';
}

export const UpgradeBanner = ({
  title,
  description,
  limitType: _limitType,
  currentUsage,
  limit,
  variant = 'default',
}: UpgradeBannerProps) => {
  const { _ } = useLingui();
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={`relative rounded-lg border p-4 ${
        variant === 'warning'
          ? 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20'
          : 'border-scriblli/20 bg-scriblli/5'
      }`}
    >
      <button
        onClick={() => setIsVisible(false)}
        className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
      >
        <XIcon className="h-4 w-4" />
      </button>

      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="font-semibold">{title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>

          {currentUsage !== undefined && limit !== undefined && (
            <div className="mt-2">
              <div className="h-2 w-full max-w-xs rounded-full bg-muted">
                <div
                  className={`h-2 rounded-full ${
                    variant === 'warning' ? 'bg-yellow-500' : 'bg-scriblli'
                  }`}
                  style={{ width: `${Math.min((currentUsage / limit) * 100, 100)}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {_`${currentUsage} of ${limit} used`}
              </p>
            </div>
          )}
        </div>

        <div className="ml-4 flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/settings/billing">
              <Trans>View Plans</Trans>
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link to="/settings/billing">
              <Trans>Upgrade Now</Trans>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};
