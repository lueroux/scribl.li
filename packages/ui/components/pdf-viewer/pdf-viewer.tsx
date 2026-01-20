import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { Trans } from '@lingui/react/macro';
import type { EnvelopeItem } from '@prisma/client';
import { Loader } from 'lucide-react';

import {
  getEnvelopeItemPageImageUrl,
  getEnvelopeMetaUrl,
} from '@documenso/lib/utils/envelope-download';

import { cn } from '../../lib/utils';
import { useToast } from '../../primitives/use-toast';
import { useVirtualList } from '../virtual-list/use-virtual-list';

export type OverrideImage = {
  base64: string;
  width: number;
  height: number;
};

export type OnPDFViewerPageClick = (_event: {
  pageNumber: number;
  numPages: number;
  originalEvent: React.MouseEvent<HTMLDivElement, MouseEvent>;
  pageHeight: number;
  pageWidth: number;
  pageX: number;
  pageY: number;
}) => void | Promise<void>;

type PageMeta = {
  width: number;
  height: number;
  documentDataId: string;
};

type LoadingState = 'loading' | 'loaded' | 'error';

const PDFLoader = () => (
  <>
    <Loader className="h-12 w-12 animate-spin text-documenso" />

    <p className="mt-4 text-muted-foreground">
      <Trans>Loading document...</Trans>
    </p>
  </>
);

export type PDFViewerProps = {
  className?: string;
  envelopeItem: Pick<EnvelopeItem, 'id' | 'envelopeId'>;
  token: string | undefined;
  presignToken?: string | undefined;
  version: 'initial' | 'current';
  onDocumentLoad?: () => void;
  overrideImages?: OverrideImage[];
  [key: string]: unknown;
} & Omit<React.HTMLAttributes<HTMLDivElement>, 'onPageClick'>;

export const PDFViewer = ({
  className,
  envelopeItem,
  token,
  presignToken,
  version,
  onDocumentLoad,
  overrideImages,
  ...props
}: PDFViewerProps) => {
  const { _ } = useLingui();
  const { toast } = useToast();

  const $el = useRef<HTMLDivElement>(null);

  const [loadingState, setLoadingState] = useState<LoadingState>(
    overrideImages ? 'loaded' : 'loading',
  );
  const [pages, setPages] = useState<PageMeta[]>([]);

  const numPages = overrideImages ? overrideImages.length : pages.length;

  /**
   * Generate URL for a specific page image.
   */
  const getPageImageUrl = useCallback(
    (pageIndex: number): string => {
      // If using override images, return data URL
      if (overrideImages && overrideImages[pageIndex]) {
        return `data:image/jpeg;base64,${overrideImages[pageIndex].base64}`;
      }

      const pageMeta = pages[pageIndex];

      if (!pageMeta) {
        return '';
      }

      return getEnvelopeItemPageImageUrl({
        envelopeItem: {
          id: envelopeItem.id,
          envelopeId: envelopeItem.envelopeId,
        },
        documentDataId: pageMeta.documentDataId,
        pageIndex,
        token,
        presignToken,
        version,
      });
    },
    [envelopeItem, pages, token, presignToken, version, overrideImages],
  );

  /**
   * Get page dimensions for a specific page.
   */
  const getPageDimensions = useCallback(
    (pageIndex: number): { width: number; height: number } => {
      if (overrideImages && overrideImages[pageIndex]) {
        return {
          width: overrideImages[pageIndex].width,
          height: overrideImages[pageIndex].height,
        };
      }

      const pageMeta = pages[pageIndex];

      if (!pageMeta) {
        return { width: 0, height: 0 };
      }

      return { width: pageMeta.width, height: pageMeta.height };
    },
    [pages, overrideImages],
  );

  // Fetch metadata when not using override images
  useEffect(() => {
    if (overrideImages) {
      setLoadingState('loaded');
      return;
    }

    const fetchMetadata = async () => {
      try {
        setLoadingState('loading');

        const metaUrl = getEnvelopeMetaUrl({
          envelopeId: envelopeItem.envelopeId,
          token,
          presignToken,
        });

        const response = await fetch(metaUrl);

        if (!response.ok) {
          throw new Error(`Failed to fetch envelope meta: ${response.status}`);
        }

        const data: {
          envelopeItems: Array<{
            id: string;
            pages: Array<{
              width: number;
              height: number;
              initialDocumentDataId: string;
              currentDocumentDataId: string;
            }>;
          }>;
        } = await response.json();

        // Find the specific envelope item
        const itemMeta = data.envelopeItems.find((item) => item.id === envelopeItem.id);

        if (!itemMeta) {
          throw new Error('Envelope item not found in metadata');
        }

        // Map pages to our internal format
        const mappedPages: PageMeta[] = itemMeta.pages.map((page) => ({
          width: page.width,
          height: page.height,
          documentDataId:
            version === 'initial' ? page.initialDocumentDataId : page.currentDocumentDataId,
        }));

        setPages(mappedPages);
        setLoadingState('loaded');
      } catch (err) {
        console.error(err);
        setLoadingState('error');

        toast({
          title: _(msg`Error`),
          description: _(msg`An error occurred while loading the document.`),
          variant: 'destructive',
        });
      }
    };

    void fetchMetadata();
  }, [envelopeItem.envelopeId, envelopeItem.id, token, presignToken, version, overrideImages]);

  // Notify when document is loaded
  useEffect(() => {
    if (loadingState === 'loaded' && onDocumentLoad) {
      onDocumentLoad();
    }
  }, [loadingState, onDocumentLoad]);

  const isLoading = loadingState === 'loading';
  const hasError = loadingState === 'error';

  return (
    <div ref={$el} className={cn('h-full w-full overflow-hidden', className)} {...props}>
      {/* Loading State */}
      {isLoading && (
        <div
          className={cn(
            'flex h-[80vh] max-h-[60rem] w-full flex-col items-center justify-center overflow-hidden rounded',
          )}
        >
          <PDFLoader />
        </div>
      )}

      {/* Error State */}
      {hasError && (
        <div className="flex h-[80vh] max-h-[60rem] flex-col items-center justify-center bg-white/50 dark:bg-background">
          <div className="text-center text-muted-foreground">
            <p>
              <Trans>Something went wrong while loading the document.</Trans>
            </p>
            <p className="mt-1 text-sm">
              <Trans>Please try again or contact our support.</Trans>
            </p>
          </div>
        </div>
      )}

      {/* Loaded State */}
      {loadingState === 'loaded' && numPages > 0 && (
        <VirtualizedPageList
          scrollParentRef={$el}
          constraintRef={$el}
          numPages={numPages}
          getPageImageUrl={getPageImageUrl}
          getPageDimensions={getPageDimensions}
        />
      )}
    </div>
  );
};

type VirtualizedPageListProps = {
  scrollParentRef: React.RefObject<HTMLDivElement>;
  constraintRef: React.RefObject<HTMLDivElement>;
  numPages: number;
  getPageImageUrl: (pageIndex: number) => string;
  getPageDimensions: (pageIndex: number) => { width: number; height: number };
  onPageClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>, pageNumber: number) => void;
};

const VirtualizedPageList = ({
  scrollParentRef,
  constraintRef,
  numPages,
  getPageImageUrl,
  getPageDimensions,
  onPageClick,
}: VirtualizedPageListProps) => {
  // Memoize pages data for consistent reference
  const pagesData = useMemo(() => {
    return Array.from({ length: numPages }, (_, i) => getPageDimensions(i));
  }, [numPages, getPageDimensions]);

  const { virtualItems, totalSize, constraintWidth } = useVirtualList({
    scrollRef: scrollParentRef,
    constraintRef,
    itemCount: numPages,
    itemSize: (index, width) => {
      const pageMeta = pagesData[index];
      // Calculate height based on aspect ratio and available width
      const aspectRatio = pageMeta.height / pageMeta.width;
      const scaledHeight = width * aspectRatio;
      // Add 32px for the page number text and margins (my-2 = 8px * 2 + text height ~16px)
      return scaledHeight + 32;
    },
    overscan: 5,
  });

  return (
    <div
      style={{
        height: `${totalSize}px`,
        width: '100%',
        position: 'relative',
      }}
    >
      {virtualItems.map((virtualItem) => {
        const index = virtualItem.index;
        const pageMeta = pagesData[index];
        const pageNumber = index + 1;
        const url = getPageImageUrl(index);

        // Calculate scale based on constraint width
        const scale = constraintWidth / pageMeta.width;
        const scaledWidth = pageMeta.width * scale;
        const scaledHeight = pageMeta.height * scale;

        return (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: constraintWidth,
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <div
              className="overflow-hidden rounded border border-border"
              data-page-number={pageNumber}
              onClick={(e) => onPageClick?.(e, pageNumber)}
            >
              <div className="relative w-full" style={{ width: scaledWidth, height: scaledHeight }}>
                <img
                  src={url}
                  alt={`Page ${pageNumber}`}
                  className="absolute inset-0 z-0 block"
                  style={{
                    width: scaledWidth,
                    height: scaledHeight,
                  }}
                  draggable={false}
                  loading="lazy"
                />
              </div>
            </div>

            <p className="my-2 text-center text-[11px] text-muted-foreground/80">
              <Trans>
                Page {pageNumber} of {numPages}
              </Trans>
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default PDFViewer;
