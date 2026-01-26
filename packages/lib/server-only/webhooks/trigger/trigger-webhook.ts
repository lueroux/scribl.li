import { WebhookTriggerEvents } from '@prisma/client';

import { jobs } from '../../../jobs/client';
import type { TWebhookDocument } from '../../../types/webhook-payload';
import { handlePipedriveIntegration } from '../../integrations/pipedrive/pipedrive-integration';
import { getAllWebhooksByEventTrigger } from '../get-all-webhooks-by-event-trigger';

export type TriggerWebhookOptions = {
  event: WebhookTriggerEvents;
  data: Record<string, unknown>;
  userId: number;
  teamId: number;
};

export const triggerWebhook = async ({ event, data, userId, teamId }: TriggerWebhookOptions) => {
  try {
    // Handle Pipedrive integration for document signed events
    if (event === WebhookTriggerEvents.DOCUMENT_SIGNED) {
      handlePipedriveIntegration({
        event,
        data: data as TWebhookDocument,
        userId,
        teamId,
      }).catch((error) => {
        // Don't let Pipedrive integration errors block other webhooks
        console.error('Pipedrive integration error:', error);
      });
    }

    const registeredWebhooks = await getAllWebhooksByEventTrigger({ event, userId, teamId });

    if (registeredWebhooks.length === 0) {
      return;
    }

    await Promise.allSettled(
      registeredWebhooks.map(async (webhook) => {
        await jobs.triggerJob({
          name: 'internal.execute-webhook',
          payload: {
            event,
            webhookId: webhook.id,
            data,
          },
        });
      }),
    );
  } catch (err) {
    console.error(err);
    throw new Error(`Failed to trigger webhook`);
  }
};
