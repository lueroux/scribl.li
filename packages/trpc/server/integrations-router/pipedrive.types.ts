import { z } from 'zod';

export const ZPipedriveConfigSchema = z.object({
  apiToken: z.string().min(1, 'API token is required'),
  companyDomain: z.string().min(1, 'Company domain is required'),
  enabled: z.boolean(),
});

export type TPipedriveConfig = z.infer<typeof ZPipedriveConfigSchema>;

export const ZGetPipedriveConfigRequestSchema = z.object({});

export type TGetPipedriveConfigRequest = z.infer<typeof ZGetPipedriveConfigRequestSchema>;

export const ZUpdatePipedriveConfigRequestSchema = ZPipedriveConfigSchema.partial().extend({
  testConnection: z.boolean().optional(),
});

export type TUpdatePipedriveConfigRequest = z.infer<typeof ZUpdatePipedriveConfigRequestSchema>;

export const ZTestPipedriveConnectionRequestSchema = z.object({
  apiToken: z.string().min(1, 'API token is required'),
  companyDomain: z.string().min(1, 'Company domain is required'),
});

export type TTestPipedriveConnectionRequest = z.infer<typeof ZTestPipedriveConnectionRequestSchema>;

export const ZPipedriveConfigResponseSchema = z.object({
  apiToken: z.string().optional(),
  companyDomain: z.string().optional(),
  enabled: z.boolean(),
  connectionStatus: z.enum(['unknown', 'connected', 'error']).optional(),
});

export type TPipedriveConfigResponse = z.infer<typeof ZPipedriveConfigResponseSchema>;
