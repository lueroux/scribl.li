import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Trans, useLingui } from '@lingui/react/macro';
import { CheckCircleIcon, XCircleIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { trpc } from '@documenso/trpc/react';
import { Button } from '@documenso/ui/primitives/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@documenso/ui/primitives/form/form';
import { Input } from '@documenso/ui/primitives/input';
import { Switch } from '@documenso/ui/primitives/switch';
import { useToast } from '@documenso/ui/primitives/use-toast';

const ZPipedriveFormSchema = z.object({
  enabled: z.boolean(),
  apiToken: z.string().optional(),
  companyDomain: z.string().optional(),
});

type TPipedriveFormSchema = z.infer<typeof ZPipedriveFormSchema>;

export interface PipedriveIntegrationFormProps {
  className?: string;
}

export const PipedriveIntegrationForm = ({ className }: PipedriveIntegrationFormProps) => {
  const { toast } = useToast();
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'error'>(
    'unknown',
  );
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  // Get current configuration
  const { data: config, refetch } = trpc.integrations.pipedrive.getConfig.useQuery({});

  // Update configuration mutation
  const { mutateAsync: updateConfig, isPending: isUpdating } =
    trpc.integrations.pipedrive.updateConfig.useMutation({
      onSuccess: (result) => {
        toast({
          title: t`Configuration saved`,
          description: t`Pipedrive integration settings have been updated successfully.`,
          duration: 5000,
        });
        
        if (result.connectionStatus) {
          setConnectionStatus(result.connectionStatus);
        }
        
        void refetch();
      },
      onError: (error) => {
        toast({
          title: t`Error`,
          description: error.message || t`Failed to update Pipedrive configuration.`,
          variant: 'destructive',
        });
      },
    });

  // Test connection mutation
  const { mutateAsync: testConnection } = trpc.integrations.pipedrive.testConnection.useMutation({
    onSuccess: (result) => {
      setConnectionStatus(result.connectionStatus);
      
      if (result.success) {
        toast({
          title: t`Connection successful`,
          description: t`Successfully connected to Pipedrive API.`,
        });
      } else {
        toast({
          title: t`Connection failed`,
          description: t`Failed to connect to Pipedrive API. Please check your credentials.`,
          variant: 'destructive',
        });
      }
    },
    onError: (error) => {
      setConnectionStatus('error');
      toast({
        title: t`Connection failed`,
        description: error.message || t`Failed to test Pipedrive connection.`,
        variant: 'destructive',
      });
    },
  });

  const form = useForm<TPipedriveFormSchema>({
    resolver: zodResolver(ZPipedriveFormSchema),
    defaultValues: {
      enabled: config?.enabled || false,
      apiToken: '',
      companyDomain: config?.companyDomain || '',
    },
    values: {
      enabled: config?.enabled || false,
      apiToken: '',
      companyDomain: config?.companyDomain || '',
    },
  });

  const onSubmit = async (data: TPipedriveFormSchema) => {
    // Only include fields that have actual values
    const updateData: Record<string, any> = {
      enabled: data.enabled,
    };

    if (data.companyDomain?.trim()) {
      updateData.companyDomain = data.companyDomain.trim();
    }

    if (data.apiToken?.trim()) {
      updateData.apiToken = data.apiToken.trim();
    }

    await updateConfig(updateData);
  };

  const handleTestConnection = async () => {
    const values = form.getValues();
    
    if (!values.apiToken?.trim() || !values.companyDomain?.trim()) {
      toast({
        title: t`Missing credentials`,
        description: t`Please enter both API token and company domain to test connection.`,
        variant: 'destructive',
      });
      return;
    }

    setIsTestingConnection(true);
    try {
      await testConnection({
        apiToken: values.apiToken.trim(),
        companyDomain: values.companyDomain.trim(),
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const getConnectionStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <CheckCircleIcon className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircleIcon className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return t`Connected`;
      case 'error':
        return t`Connection failed`;
      default:
        return t`Not tested`;
    }
  };

  return (
    <div className={className}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Enable/Disable Integration */}
          <FormField
            control={form.control}
            name="enabled"
            render={({ field }: { field: any }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    <Trans>Enable Pipedrive Integration</Trans>
                  </FormLabel>
                  <FormDescription>
                    <Trans>
                      Automatically create activities in Pipedrive when documents are signed.
                    </Trans>
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Configuration Fields */}
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="companyDomain"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>
                    <Trans>Company Domain</Trans>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="company-name"
                      disabled={isUpdating}
                    />
                  </FormControl>
                  <FormDescription>
                    <Trans>
                      Your Pipedrive company domain (e.g., "company-name" from company-name.pipedrive.com)
                    </Trans>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="apiToken"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>
                    <Trans>API Token</Trans>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      placeholder="Enter your Pipedrive API token"
                      disabled={isUpdating}
                    />
                  </FormControl>
                  <FormDescription>
                    <Trans>
                      Your Pipedrive API token. You can find this in your Pipedrive settings under API.
                    </Trans>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Connection Status */}
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <div className="text-sm font-medium">
                  <Trans>Connection Status</Trans>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {getConnectionStatusIcon()}
                  <span>{getConnectionStatusText()}</span>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleTestConnection}
                disabled={isTestingConnection || isUpdating}
                loading={isTestingConnection}
              >
                <Trans>Test Connection</Trans>
              </Button>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button type="submit" loading={isUpdating} disabled={isUpdating}>
              <Trans>Save Configuration</Trans>
            </Button>
          </div>
        </form>
      </Form>

      {/* Help Text */}
      <div className="mt-6 rounded-lg bg-muted/50 p-4">
        <div className="text-sm font-medium mb-2">
          <Trans>How it works:</Trans>
        </div>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• <Trans>When a document is signed in Scriblli, an activity will be created in Pipedrive</Trans></li>
          <li>• <Trans>Activities include document details, signers, and completion status</Trans></li>
          <li>• <Trans>If your document has an external ID like "deal_123", it will be linked to deal #123</Trans></li>
          <li>• <Trans>Configure your Pipedrive API token and company domain to get started</Trans></li>
        </ul>
      </div>
    </div>
  );
};
