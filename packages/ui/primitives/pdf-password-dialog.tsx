import * as React from 'react';

import { Trans, t } from '@lingui/macro';
import { EyeIcon, EyeOffIcon } from 'lucide-react';

import { Button } from './button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './dialog';
import { Input } from './input';
import { Label } from './label';

export interface PdfPasswordDialogProps {
  open: boolean;
  fileName?: string;
  isSubmitting?: boolean;
  error?: string;
  onSubmit: (password: string) => void;
  onCancel: () => void;
}

export const PdfPasswordDialog = ({
  open,
  fileName,
  isSubmitting = false,
  error,
  onSubmit,
  onCancel,
}: PdfPasswordDialogProps) => {
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim()) {
      onSubmit(password);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && !isSubmitting) {
      onCancel();
    }
  };

  // Reset password when dialog closes
  React.useEffect(() => {
    if (!open) {
      setPassword('');
      setShowPassword(false);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              <Trans>Password Required</Trans>
            </DialogTitle>
            <DialogDescription>
              <Trans>
                The PDF{fileName && ` "${fileName}"`} is password-protected. Please enter the
                password to continue.
              </Trans>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="pdf-password">
                <Trans>Password</Trans>
              </Label>
              <div className="relative">
                <Input
                  id="pdf-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t`Enter PDF password...`}
                  disabled={isSubmitting}
                  autoFocus
                  aria-invalid={!!error}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isSubmitting}
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-4 w-4" />
                  ) : (
                    <EyeIcon className="h-4 w-4" />
                  )}
                  <span className="sr-only">
                    {showPassword ? <Trans>Hide password</Trans> : <Trans>Show password</Trans>}
                  </span>
                </Button>
              </div>
              {error && (
                <p className="text-sm text-red-600 dark:text-red-400" role="alert">
                  {error}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              <Trans>Cancel</Trans>
            </Button>
            <Button
              type="submit"
              disabled={!password.trim() || isSubmitting}
              loading={isSubmitting}
            >
              <Trans>Unlock PDF</Trans>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
