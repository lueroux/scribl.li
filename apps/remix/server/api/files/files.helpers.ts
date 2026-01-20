import {
  type DocumentData,
  type DocumentDataType,
  DocumentStatus,
  type EnvelopeItem,
} from '@prisma/client';
import contentDisposition from 'content-disposition';
import { type Context } from 'hono';

import { pdfToImage } from '@documenso/lib/server-only/ai/pdf-to-images';
import { sha256 } from '@documenso/lib/universal/crypto';
import { getFileServerSide } from '@documenso/lib/universal/upload/get-file.server';
import { extractAndStorePdfImages } from '@documenso/lib/universal/upload/put-file.server';
import { getS3File } from '@documenso/lib/universal/upload/server-actions';

import type { HonoEnv } from '../../router';
import type { TGetEnvelopeMetaResponse } from './files.types';

type HandleEnvelopeItemFileRequestOptions = {
  title: string;
  status: DocumentStatus;
  documentData: {
    type: DocumentDataType;
    data: string;
    initialData: string;
  };
  version: 'signed' | 'original';
  isDownload: boolean;
  context: Context<HonoEnv>;
};

/**
 * Helper function to handle envelope item file requests (both view and download)
 */
export const handleEnvelopeItemFileRequest = async ({
  title,
  status,
  documentData,
  version,
  isDownload,
  context: c,
}: HandleEnvelopeItemFileRequestOptions) => {
  const documentDataToUse = version === 'signed' ? documentData.data : documentData.initialData;

  const etag = Buffer.from(sha256(documentDataToUse)).toString('hex');

  if (c.req.header('If-None-Match') === etag && !isDownload) {
    return c.body(null, 304);
  }

  const file = await getFileServerSide({
    type: documentData.type,
    data: documentDataToUse,
  }).catch((error) => {
    console.error(error);

    return null;
  });

  if (!file) {
    return c.json({ error: 'File not found' }, 404);
  }

  c.header('Content-Type', 'application/pdf');
  c.header('ETag', etag);

  if (!isDownload) {
    if (status === DocumentStatus.COMPLETED) {
      c.header('Cache-Control', 'public, max-age=31536000, immutable');
    } else {
      c.header('Cache-Control', 'public, max-age=0, must-revalidate');
    }
  }

  if (isDownload) {
    // Generate filename following the pattern from envelope-download-dialog.tsx
    const baseTitle = title.replace(/\.pdf$/, '');
    const suffix = version === 'signed' ? '_signed.pdf' : '.pdf';
    const filename = `${baseTitle}${suffix}`;

    c.header('Content-Disposition', contentDisposition(filename));

    // For downloads, prevent caching to ensure fresh data
    c.header('Cache-Control', 'no-cache, no-store, must-revalidate');
    c.header('Pragma', 'no-cache');
    c.header('Expires', '0');
  }

  return c.body(file);
};

type handleEnvelopeItemsMetaRequestOptions = {
  c: Context<HonoEnv>;
  envelopeItems: (EnvelopeItem & {
    documentData: DocumentData;
  })[];
};

export const handleEnvelopeItemsMetaRequest = async ({
  c,
  envelopeItems,
}: handleEnvelopeItemsMetaRequestOptions) => {
  const response = await Promise.all(
    envelopeItems.map(async (item) => {
      let pageMetadata = item.documentData.metadata;

      // Runtime backfill if pageMetadata is missing
      if (!pageMetadata && item.documentData) {
        const pdfBytes = await getFileServerSide({
          type: item.documentData.type,
          data: item.documentData.initialData,
        });

        const pdfPageMetadata = await extractAndStorePdfImages(
          new Uint8Array(pdfBytes).buffer,
          item.documentData.id,
        );

        pageMetadata = {
          pages: pdfPageMetadata,
        };
      }

      const pages = pageMetadata?.pages ?? [];

      return {
        id: item.id,
        pages: pages.map((page) => ({
          width: page.width,
          height: page.height,
          initialDocumentDataId: item.documentData.id,
          currentDocumentDataId: item.documentData.id,
        })),
      };
    }),
  );

  return c.json({ envelopeItems: response } satisfies TGetEnvelopeMetaResponse);
};

type HandleEnvelopeItemPageRequestOptions = {
  c: Context<HonoEnv>;
  envelopeItem: EnvelopeItem & {
    documentData: DocumentData;
  };
  pageIndex: number;
  version: 'initial' | 'current';
};

export const handleEnvelopeItemPageRequest = async ({
  c,
  envelopeItem,
  pageIndex,
  version,
}: HandleEnvelopeItemPageRequestOptions) => {
  // Determine which PDF data to use based on version requested.
  const documentDataToUse =
    version === 'current' ? envelopeItem.documentData.data : envelopeItem.documentData.initialData;

  // Generate ETag from document data hash + page index
  const etag = generatePageEtag(documentDataToUse, pageIndex);

  c.header('ETag', etag);
  c.header('Cache-Control', 'public, max-age=31536000, immutable');

  if (c.req.header('If-None-Match') === etag) {
    return c.body(null, 304);
  }

  c.header('Content-Type', 'image/jpeg');

  // Try to find the page image is S3.
  if (envelopeItem.documentData.type === 'S3_PATH') {
    const s3Key = getEnvelopeItemS3Key(documentDataToUse, pageIndex);

    const currentTime = Date.now();
    const image = await getS3File(s3Key);
    const endTime = Date.now();
    console.log(`S3 fetch time: ${endTime - currentTime}ms`);

    if (image) {
      console.log('hit s3');
      return c.body(image);
    }
  }

  // Fetch PDF bytes
  const pdfBytes = await getFileServerSide({
    type: envelopeItem.documentData.type,
    data: documentDataToUse,
  });

  // Render page to image
  const { image } = await pdfToImage(pdfBytes, {
    scale: 2,
    // quality: 0.9,
    pageIndex,
  });

  return c.body(image);
};

/**
 * Generates an ETag for a page image based on document data and page index.
 */
export const generatePageEtag = (documentData: string, pageIndex: number): string => {
  const hash = sha256(`${documentData}:${pageIndex}`);

  return Buffer.from(hash).toString('hex');
};

export const getEnvelopeItemS3Key = (documentData: string, pageIndex: number): string => {
  // Sanity check incase someone passes in a base64 PDF somehow.
  if (documentData.length > 100) {
    throw new Error('Document data is too long to be a valid S3 key');
  }

  const baseKey = documentData.split('/')[0];

  return `${baseKey}/${pageIndex}.jpeg`;
};
