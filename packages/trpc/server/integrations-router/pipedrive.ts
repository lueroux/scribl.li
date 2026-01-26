import { createPipedriveService } from '@documenso/lib/server-only/integrations/pipedrive/pipedrive-service';
import {
  getPipedriveConfigForTeam,
  updatePipedriveConfigForTeam,
} from '@documenso/lib/server-only/integrations/pipedrive/pipedrive-integration';

import { authenticatedProcedure, router } from '../trpc';
import {
  ZGetPipedriveConfigRequestSchema,
  ZTestPipedriveConnectionRequestSchema,
  ZUpdatePipedriveConfigRequestSchema,
} from './pipedrive.types';

export const pipedriveRouter = router({
  /**
   * Get current Pipedrive configuration for the team
   */
  getConfig: authenticatedProcedure
    .input(ZGetPipedriveConfigRequestSchema)
    .query(async ({ ctx }) => {
      const config = await getPipedriveConfigForTeam(ctx.user.id, ctx.teamId);
      
      // Don't return the actual API token for security
      return {
        apiToken: config.apiToken ? '••••••••' : '',
        companyDomain: config.companyDomain,
        enabled: config.enabled,
        connectionStatus: 'unknown' as const,
      };
    }),

  /**
   * Update Pipedrive configuration for the team
   */
  updateConfig: authenticatedProcedure
    .input(ZUpdatePipedriveConfigRequestSchema)
    .mutation(async ({ input, ctx }) => {
      const { testConnection, ...configData } = input;

      // Update the configuration
      await updatePipedriveConfigForTeam(ctx.user.id, ctx.teamId, configData);

      // Test connection if requested
      let connectionStatus: 'unknown' | 'connected' | 'error' = 'unknown';
      
      if (testConnection && configData.apiToken && configData.companyDomain) {
        try {
          const pipedriveService = createPipedriveService({
            apiToken: configData.apiToken,
            companyDomain: configData.companyDomain,
            enabled: configData.enabled ?? true,
          });

          const isConnected = await pipedriveService.testConnection();
          connectionStatus = isConnected ? 'connected' : 'error';
        } catch (error) {
          console.error('Pipedrive connection test failed:', error);
          connectionStatus = 'error';
        }
      }

      ctx.logger.info({
        message: 'Pipedrive configuration updated',
        teamId: ctx.teamId,
        enabled: configData.enabled,
        connectionStatus,
      });

      return {
        success: true,
        connectionStatus,
      };
    }),

  /**
   * Test Pipedrive connection without saving configuration
   */
  testConnection: authenticatedProcedure
    .input(ZTestPipedriveConnectionRequestSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const pipedriveService = createPipedriveService({
          apiToken: input.apiToken,
          companyDomain: input.companyDomain,
          enabled: true,
        });

        const isConnected = await pipedriveService.testConnection();
        
        ctx.logger.info({
          message: 'Pipedrive connection test',
          teamId: ctx.teamId,
          success: isConnected,
        });

        return {
          success: isConnected,
          connectionStatus: isConnected ? ('connected' as const) : ('error' as const),
        };
      } catch (error) {
        ctx.logger.error({
          message: 'Pipedrive connection test failed',
          teamId: ctx.teamId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });

        return {
          success: false,
          connectionStatus: 'error' as const,
        };
      }
    }),
});
