import type { EnvelopeItem } from '@prisma/client';

import { NEXT_PUBLIC_WEBAPP_URL } from '../constants/app';

export type EnvelopeItemPdfUrlOptions =
  | {
      type: 'download';
      envelopeItem: Pick<EnvelopeItem, 'id' | 'envelopeId'>;
      token: string | undefined;
      version: 'original' | 'signed';
      presignToken?: undefined;
    }
  | {
      type: 'view';
      envelopeItem: Pick<EnvelopeItem, 'id' | 'envelopeId'>;
      token: string | undefined;
      presignToken?: string | undefined;
    };

export const getEnvelopeItemPdfUrl = (options: EnvelopeItemPdfUrlOptions) => {
  const { envelopeItem, token, type, presignToken } = options;

  const { id, envelopeId } = envelopeItem;

  if (type === 'download') {
    const version = options.version;

    // /api/files/envelope/envelope_123/envelopeItem/envelope_item_123/current/cmkeoi639001frrc8moyrfbax/1/image.jpeg

    // const test =     `${NEXT_PUBLIC_WEBAPP_URL()}/api/files/envelope/${envelopeId}/envelopeItem/${version}/${id}/`;

    return token
      ? `${NEXT_PUBLIC_WEBAPP_URL()}/api/files/token/${token}/envelopeItem/${id}/download/${version}${presignToken ? `?presignToken=${presignToken}` : ''}`
      : `${NEXT_PUBLIC_WEBAPP_URL()}/api/files/envelope/${envelopeId}/envelopeItem/${id}/download/${version}`;
  }

  return token
    ? `${NEXT_PUBLIC_WEBAPP_URL()}/api/files/token/${token}/envelopeItem/${id}${presignToken ? `?presignToken=${presignToken}` : ''}`
    : `${NEXT_PUBLIC_WEBAPP_URL()}/api/files/envelope/${envelopeId}/envelopeItem/${id}${presignToken ? `?token=${presignToken}` : ''}`;
};

export type EnvelopeItemPageImageUrlOptions = {
  envelopeItem: Pick<EnvelopeItem, 'id' | 'envelopeId'>;
  documentDataId: string;
  pageIndex: number;
  token: string | undefined;
  presignToken?: string | undefined;
  version?: 'initial' | 'current';
};

/**
 * Generates the URL for fetching a single page of a PDF as an image.
 */
export const getEnvelopeItemPageImageUrl = (options: EnvelopeItemPageImageUrlOptions): string => {
  const { envelopeItem, documentDataId, pageIndex, token, presignToken, version } = options;
  const { id, envelopeId } = envelopeItem;

  if (token) {
    return `${NEXT_PUBLIC_WEBAPP_URL()}/api/files/token/${token}/envelope/${envelopeId}/envelopeItem/${id}/dataId/${documentDataId}/${version}/${pageIndex}/image.jpeg`;
  }

  const baseUrl = `${NEXT_PUBLIC_WEBAPP_URL()}/api/files/envelope/${envelopeId}/envelopeItem/${id}/dataId/${documentDataId}/${version}/${pageIndex}/image.jpeg`;

  if (presignToken) {
    return `${baseUrl}?presignToken=${presignToken}`;
  }

  return baseUrl;
};

export type EnvelopeMetaUrlOptions = {
  envelopeId: string;
  token: string | undefined;
  presignToken?: string | undefined;
};

/**
 * Generates the URL for fetching envelope metadata (page counts and dimensions).
 */
export const getEnvelopeMetaUrl = (options: EnvelopeMetaUrlOptions): string => {
  const { envelopeId, token, presignToken } = options;

  if (token) {
    return `${NEXT_PUBLIC_WEBAPP_URL()}/api/files/token/${token}/envelope/${envelopeId}/meta`;
  }

  const baseUrl = `${NEXT_PUBLIC_WEBAPP_URL()}/api/files/envelope/${envelopeId}/meta`;

  if (presignToken) {
    return `${baseUrl}?presignToken=${presignToken}`;
  }

  return baseUrl;
};
