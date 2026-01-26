import { env } from '@documenso/lib/utils/env';

import { AppError, AppErrorCode } from '../../../errors/app-error';
import type { TWebhookDocument } from '../../../types/webhook-payload';

export interface PipedriveConfig {
  apiToken: string;
  companyDomain: string;
  enabled: boolean;
}

export interface CreateActivityRequest {
  subject: string;
  type: string;
  note?: string;
  deal_id?: number;
  person_id?: number;
  org_id?: number;
  due_date?: string;
  due_time?: string;
}

export interface PipedriveActivity {
  id: number;
  subject: string;
  type: string;
  note: string;
  due_date: string;
  due_time: string;
  deal_id: number | null;
  person_id: number | null;
  org_id: number | null;
}

export interface PipedriveApiResponse<T> {
  success: boolean;
  data: T;
  additional_data?: any;
}

/**
 * Service for integrating with Pipedrive API
 */
export class PipedriveService {
  private config: PipedriveConfig;

  constructor(config: PipedriveConfig) {
    this.config = config;
  }

  /**
   * Create an activity in Pipedrive when a document is signed
   */
  async createDocumentSignedActivity(document: TWebhookDocument): Promise<PipedriveActivity> {
    if (!this.config.enabled) {
      throw new AppError(AppErrorCode.INVALID_REQUEST, {
        message: 'Pipedrive integration is not enabled',
      });
    }

    const activityData: CreateActivityRequest = {
      subject: `Document "${document.title}" has been signed`,
      type: 'task', // Default activity type, can be customized
      note: this.generateDocumentSignedNote(document),
    };

    // Try to extract deal/person IDs from document metadata or external ID
    const dealId = this.extractDealIdFromDocument(document);
    if (dealId) {
      activityData.deal_id = dealId;
    }

    return await this.createActivity(activityData);
  }

  /**
   * Create an activity in Pipedrive
   */
  async createActivity(activityData: CreateActivityRequest): Promise<PipedriveActivity> {
    const url = `https://${this.config.companyDomain}.pipedrive.com/api/v2/activities?api_token=${this.config.apiToken}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(activityData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Pipedrive API error:', response.status, errorText);
        
        throw new AppError(AppErrorCode.UNKNOWN_ERROR, {
          message: `Pipedrive API request failed with status ${response.status}`,
        });
      }

      const result: PipedriveApiResponse<PipedriveActivity> = await response.json();

      if (!result.success) {
        throw new AppError(AppErrorCode.UNKNOWN_ERROR, {
          message: 'Pipedrive API returned unsuccessful response',
        });
      }

      return result.data;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      console.error('Pipedrive integration error:', error);
      throw new AppError(AppErrorCode.UNKNOWN_ERROR, {
        message: 'Failed to create Pipedrive activity',
      });
    }
  }

  /**
   * Test the Pipedrive API connection
   */
  async testConnection(): Promise<boolean> {
    const url = `https://${this.config.companyDomain}.pipedrive.com/api/v2/users/me?api_token=${this.config.apiToken}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Pipedrive connection test failed:', error);
      return false;
    }
  }

  /**
   * Generate a detailed note for the document signed activity
   */
  private generateDocumentSignedNote(document: TWebhookDocument): string {
    const completedRecipients = document.recipients.filter(r => r.signedAt !== null);
    const totalRecipients = document.recipients.length;

    let note = `📄 Document: ${document.title}\n`;
    note += `✅ Status: ${document.status}\n`;
    note += `👥 Signed by: ${completedRecipients.length}/${totalRecipients} recipients\n`;
    
    if (document.completedAt) {
      note += `📅 Completed: ${new Date(document.completedAt).toLocaleString()}\n`;
    }

    // Add signer details
    if (completedRecipients.length > 0) {
      note += `\nSigners:\n`;
      completedRecipients.forEach(recipient => {
        note += `• ${recipient.name} (${recipient.email}) - ${new Date(recipient.signedAt!).toLocaleString()}\n`;
      });
    }

    // Add external reference if available
    if (document.externalId) {
      note += `\n🔗 Reference: ${document.externalId}`;
    }

    return note;
  }

  /**
   * Extract deal ID from document external ID or metadata
   * This is a simple implementation - in practice you'd want more sophisticated mapping
   */
  private extractDealIdFromDocument(document: TWebhookDocument): number | undefined {
    // Try to extract deal ID from external ID (e.g., "deal_123" -> 123)
    if (document.externalId && document.externalId.startsWith('deal_')) {
      const dealId = parseInt(document.externalId.replace('deal_', ''), 10);
      if (!isNaN(dealId)) {
        return dealId;
      }
    }

    // Could also check document metadata for deal associations
    // This would be customized based on how teams structure their data
    return undefined;
  }
}

/**
 * Factory function to create PipedriveService instances
 */
export const createPipedriveService = (config: PipedriveConfig): PipedriveService => {
  return new PipedriveService(config);
};

/**
 * Get default Pipedrive configuration from environment
 */
export const getDefaultPipedriveConfig = (): Partial<PipedriveConfig> => {
  return {
    apiToken: env('PIPEDRIVE_API_TOKEN'),
    companyDomain: env('PIPEDRIVE_COMPANY_DOMAIN'),
    enabled: !!env('PIPEDRIVE_API_TOKEN') && !!env('PIPEDRIVE_COMPANY_DOMAIN'),
  };
};
