import { WebhookTriggerEvents } from '@prisma/client';

import { prisma } from '@documenso/prisma';

import { AppError, AppErrorCode } from '../../../errors/app-error';
import type { TWebhookDocument } from '../../../types/webhook-payload';
import { buildTeamWhereQuery } from '../../../utils/teams';
import { createPipedriveService } from './pipedrive-service';
import type { PipedriveConfig } from './pipedrive-service';

export interface PipedriveIntegrationOptions {
  event: WebhookTriggerEvents;
  data: TWebhookDocument;
  userId: number;
  teamId: number;
}

/**
 * Handle Pipedrive integration when documents are signed
 */
export const handlePipedriveIntegration = async ({
  event,
  data,
  userId,
  teamId,
}: PipedriveIntegrationOptions): Promise<void> => {
  // Only handle document signed events for now
  if (event !== WebhookTriggerEvents.DOCUMENT_SIGNED) {
    return;
  }

  try {
    // Get team's Pipedrive configuration
    const pipedriveConfig = await getPipedriveConfigForTeam(userId, teamId);
    
    if (!pipedriveConfig.enabled) {
      console.log(`Pipedrive integration disabled for team ${teamId}`);
      return;
    }

    // Create Pipedrive service instance
    const pipedriveService = createPipedriveService(pipedriveConfig);

    // Test connection before attempting to create activity
    const connectionValid = await pipedriveService.testConnection();
    if (!connectionValid) {
      console.error(`Pipedrive connection failed for team ${teamId}`);
      return;
    }

    // Create activity in Pipedrive
    const activity = await pipedriveService.createDocumentSignedActivity(data);
    
    console.log(`Created Pipedrive activity ${activity.id} for document ${data.id}`);

    // Log the successful integration
    await logPipedriveIntegration({
      teamId,
      documentId: data.id,
      pipedriveActivityId: activity.id,
      status: 'SUCCESS',
    });

  } catch (error) {
    console.error('Pipedrive integration failed:', error);

    // Log the failed integration
    await logPipedriveIntegration({
      teamId,
      documentId: data.id,
      pipedriveActivityId: null,
      status: 'FAILED',
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    // Don't throw the error to prevent disrupting other webhook handlers
  }
};

/**
 * Get Pipedrive configuration for a team
 */
export const getPipedriveConfigForTeam = async (
  userId: number,
  teamId: number,
): Promise<PipedriveConfig> => {
  const team = await prisma.team.findFirst({
    where: buildTeamWhereQuery({
      teamId,
      userId,
    }),
    include: {
      teamGlobalSettings: true,
    },
  });

  if (!team) {
    throw new AppError(AppErrorCode.NOT_FOUND, {
      message: 'Team not found',
    });
  }

  // Get Pipedrive settings from team global settings
  const settings = team.teamGlobalSettings;
  const pipedriveSettings = settings?.data as any;

  return {
    apiToken: pipedriveSettings?.pipedrive?.apiToken || '',
    companyDomain: pipedriveSettings?.pipedrive?.companyDomain || '',
    enabled: pipedriveSettings?.pipedrive?.enabled === true,
  };
};

/**
 * Update Pipedrive configuration for a team
 */
export const updatePipedriveConfigForTeam = async (
  userId: number,
  teamId: number,
  config: Partial<PipedriveConfig>,
): Promise<void> => {
  const team = await prisma.team.findFirst({
    where: buildTeamWhereQuery({
      teamId,
      userId,
    }),
    include: {
      teamGlobalSettings: true,
    },
  });

  if (!team) {
    throw new AppError(AppErrorCode.NOT_FOUND, {
      message: 'Team not found',
    });
  }

  // Get existing settings or create new ones
  let existingData = {};
  if (team.teamGlobalSettings?.data) {
    existingData = team.teamGlobalSettings.data as any;
  }

  // Update Pipedrive settings
  const updatedData = {
    ...existingData,
    pipedrive: {
      ...(existingData as any).pipedrive,
      ...config,
    },
  };

  // Upsert team global settings
  await prisma.teamGlobalSettings.upsert({
    where: {
      id: team.id.toString(),
    },
    create: {
      id: team.id.toString(),
      team: {
        connect: {
          id: team.id,
        },
      },
      data: updatedData,
    },
    update: {
      data: updatedData,
    },
  });
};

interface LogPipedriveIntegrationOptions {
  teamId: number;
  documentId: number;
  pipedriveActivityId: number | null;
  status: 'SUCCESS' | 'FAILED';
  error?: string;
}

/**
 * Log Pipedrive integration attempts for debugging and monitoring
 */
const logPipedriveIntegration = async ({
  teamId,
  documentId,
  pipedriveActivityId,
  status,
  error,
}: LogPipedriveIntegrationOptions): Promise<void> => {
  try {
    // This would typically go to a dedicated integration logs table
    // For now, we'll just console log, but you could extend this to store in DB
    const logEntry = {
      teamId,
      documentId,
      pipedriveActivityId,
      status,
      error,
      timestamp: new Date().toISOString(),
    };

    console.log('Pipedrive integration log:', JSON.stringify(logEntry, null, 2));

    // TODO: Consider adding a dedicated integration_logs table for proper monitoring
  } catch (logError) {
    console.error('Failed to log Pipedrive integration:', logError);
  }
};
