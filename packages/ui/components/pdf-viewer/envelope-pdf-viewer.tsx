import React, { useEffect, useMemo, useRef } from 'react';

import type { MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { Trans, useLingui } from '@lingui/react/macro';

import type { PageRenderData } from '@documenso/lib/client-only/providers/envelope-render-provider';
import { useCurrentEnvelopeRender } from '@documenso/lib/client-only/providers/envelope-render-provider';
import { cn } from '@documenso/ui/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@documenso/ui/primitives/alert';

import { Spinner } from '../../primitives/spinner';
import { useVirtualList } from '../virtual-list/use-virtual-list';

export type PDFViewerRendererMode = 'editor' | 'preview' | 'signing';

const RendererErrorMessages: Record<
  PDFViewerRendererMode,
  { title: MessageDescriptor; description: MessageDescriptor }
> = {
  editor: {
    title: msg`Configuration Error`,
    description: msg`There was an issue rendering some fields, please review the fields and try again.`,
  },
  preview: {
    title: msg`Configuration Error`,
    description: msg`Something went wrong while rendering the document, some fields may be missing or corrupted.`,
  },
  signing: {
    title: msg`Configuration Error`,
    description: msg`Something went wrong while rendering the document, some fields may be missing or corrupted.`,
  },
};

export type EnvelopePdfViewerProps = {
  className?: string;
  scrollParentRef?: React.RefObject<HTMLDivElement>;
  onDocumentLoad?: () => void;

  /**
   * Custom page renderer to use instead of just rendering the page as an image.
   *
   * Mainly used for when you want to render the page with Konva.
   */
  customPageRenderer?: React.FunctionComponent<{ pageData: PageRenderData }>;

  /**
   * The context the PDF is being rendered in, used for error messages.
   */
  renderer: PDFViewerRendererMode;
  [key: string]: unknown;
} & Omit<React.HTMLAttributes<HTMLDivElement>, 'onPageClick'>;

export const EnvelopePdfViewer = ({
  className,
  scrollParentRef,
  onDocumentLoad,
  customPageRenderer: CustomPageRenderer,
  renderer,
  ...props
}: EnvelopePdfViewerProps) => {
  const { t } = useLingui();

  const $el = useRef<HTMLDivElement>(null);

  const { currentEnvelopeItem, envelopeItemsMeta, loadingState, getPageImageUrl, renderError } =
    useCurrentEnvelopeRender();

  // Get metadata for the current envelope item
  const currentItemMeta = useMemo(() => {
    if (!currentEnvelopeItem) {
      return null;
    }

    return envelopeItemsMeta[currentEnvelopeItem.id] ?? null;
  }, [currentEnvelopeItem, envelopeItemsMeta]);

  const numPages = currentItemMeta?.pages?.length ?? 0;

  // Notify when document is loaded
  useEffect(() => {
    if (loadingState === 'loaded' && onDocumentLoad) {
      onDocumentLoad();
    }
  }, [loadingState, onDocumentLoad]);

  const isLoading = loadingState === 'loading';
  const hasError = loadingState === 'error';

  return (
    <div ref={$el} className={cn('h-full w-full max-w-[800px]', className)} {...props}>
      {renderError && (
        <Alert variant="destructive" className="mb-4 max-w-[800px]">
          <AlertTitle>{t(RendererErrorMessages[renderer].title)}</AlertTitle>
          <AlertDescription>{t(RendererErrorMessages[renderer].description)}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {isLoading && (
        <div
          className={cn(
            'flex h-[80vh] max-h-[60rem] w-full flex-col items-center justify-center overflow-hidden',
          )}
        >
          <Spinner />
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

      {/* Loaded State - Render Pages (wait for width to be calculated) */}
      {loadingState === 'loaded' && currentEnvelopeItem && currentItemMeta && numPages > 0 && (
        <VirtualizedPageList
          scrollParentRef={scrollParentRef ?? $el}
          constraintRef={$el}
          pages={currentItemMeta.pages}
          envelopeItemId={currentEnvelopeItem.id}
          numPages={numPages}
          getPageImageUrl={getPageImageUrl}
          CustomPageRenderer={CustomPageRenderer}
        />
      )}

      {/* No current item selected */}
      {loadingState === 'loaded' && !currentEnvelopeItem && (
        <div
          className={cn(
            'flex h-[80vh] max-h-[60rem] w-full flex-col items-center justify-center overflow-hidden rounded',
          )}
        >
          <p className="text-sm text-muted-foreground">
            <Trans>No document selected</Trans>
          </p>
        </div>
      )}
    </div>
  );
};

type VirtualizedPageListProps = {
  scrollParentRef: React.RefObject<HTMLDivElement>;
  constraintRef: React.RefObject<HTMLDivElement>;
  pages: Array<{ width: number; height: number }>;
  envelopeItemId: string;
  numPages: number;
  getPageImageUrl: (envelopeItemId: string, pageIndex: number) => string;
  CustomPageRenderer?: React.FunctionComponent<{ pageData: PageRenderData }>;
};

const VirtualizedPageList = ({
  scrollParentRef,
  constraintRef,
  pages,
  envelopeItemId,
  numPages,
  getPageImageUrl,
  CustomPageRenderer,
}: VirtualizedPageListProps) => {
  const { virtualItems, totalSize, constraintWidth } = useVirtualList({
    scrollRef: scrollParentRef,
    constraintRef,
    itemCount: numPages,
    itemSize: (index, width) => {
      const pageMeta = pages[index];
      // Calculate height based on aspect ratio and available width
      const aspectRatio = pageMeta.height / pageMeta.width;
      const scaledHeight = width * aspectRatio;
      // Add 32px for the page number text and margins (my-2 = 8px * 2 + text height ~16px)
      return scaledHeight + 32;
    },
    overscan: 10,
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
        const pageMeta = pages[index];
        const pageNumber = index + 1;
        const url = getPageImageUrl(envelopeItemId, index);

        // Calculate scale based on constraint width
        const scale = constraintWidth / pageMeta.width;

        console.log({
          pageMetaWidth: pageMeta.width,
          constraintWidth,
          scale,
        });

        const pageData: PageRenderData = {
          pageNumber,
          pageIndex: index,
          pageWidth: pageMeta.width,
          pageHeight: pageMeta.height,
          scale,
          pageImageUrl: url,
          rotate: 0,
        };

        return (
          <div
            key={envelopeItemId + '-' + virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: constraintWidth,
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
            // className="will-change-transform"
          >
            <div className="rounded border border-border">
              {CustomPageRenderer ? (
                <CustomPageRenderer pageData={pageData} />
              ) : (
                <ImagePageRenderer pageData={pageData} />
              )}
            </div>

            <p className="my-2 text-center text-[11px] text-muted-foreground/80">
              Page {pageNumber} of {numPages}
            </p>
          </div>
        );
      })}
    </div>
  );
};

const ImagePageRenderer = ({ pageData }: { pageData: PageRenderData }) => {
  const { pageWidth, pageHeight, scale, pageImageUrl, pageNumber } = pageData;

  const scaledWidth = pageWidth * scale;
  const scaledHeight = pageHeight * scale;

  return (
    <div className="relative w-full" style={{ width: scaledWidth, height: scaledHeight }}>
      <img
        src={pageImageUrl}
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
  );
};

export default EnvelopePdfViewer;
