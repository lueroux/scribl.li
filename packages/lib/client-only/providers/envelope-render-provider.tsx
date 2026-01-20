import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import React from 'react';

import type { Field, Recipient } from '@prisma/client';

import type { TRecipientColor } from '@documenso/ui/lib/recipient-colors';
import { AVAILABLE_RECIPIENT_COLORS } from '@documenso/ui/lib/recipient-colors';

import type { TEnvelope } from '../../types/envelope';
import type { TEnvelopeItemMeta } from '../../types/envelope-item-meta';
import type { FieldRenderMode } from '../../universal/field-renderer/render-field';
import { getEnvelopeItemPageImageUrl, getEnvelopeMetaUrl } from '../../utils/envelope-download';

/**
 * Extended envelope item meta that includes documentDataId fields from the API response.
 */
type TEnvelopeItemMetaWithDataId = Omit<TEnvelopeItemMeta, 'pages'> & {
  id: string;
  pages: (TEnvelopeItemMeta['pages'][number] & {
    initialDocumentDataId: string;
    currentDocumentDataId: string;
  })[];
};

/**
 * Number of pages to load eagerly on initial render.
 * Pages beyond this threshold will be loaded lazily when they enter the viewport.
 */
export const EAGER_LOAD_PAGE_COUNT = 5;

export type PageRenderData = {
  pageNumber: number;
  pageIndex: number;
  pageWidth: number;
  pageHeight: number;
  scale: number;
  pageImageUrl: string;
  rotate: number;
};

export type ImageLoadingState = 'loading' | 'loaded' | 'error';

type EnvelopeRenderOverrideSettings = {
  mode?: FieldRenderMode;
  showRecipientTooltip?: boolean;
  showRecipientSigningStatus?: boolean;
};

type EnvelopeRenderItem = TEnvelope['envelopeItems'][number];

type EnvelopeRenderProviderValue = {
  envelopeItemsMeta: Record<string, TEnvelopeItemMetaWithDataId>;
  loadingState: ImageLoadingState;
  getPageImageUrl: (envelopeItemId: string, pageIndex: number) => string;
  getPageData: (envelopeItemId: string, pageIndex: number) => PageRenderData;
  // Existing API
  envelopeItems: EnvelopeRenderItem[];
  envelopeStatus: TEnvelope['status'];
  envelopeType: TEnvelope['type'];
  currentEnvelopeItem: EnvelopeRenderItem | null;
  setCurrentEnvelopeItem: (envelopeItemId: string) => void;
  fields: Field[];
  recipients: Pick<Recipient, 'id' | 'name' | 'email' | 'signingStatus'>[];
  getRecipientColorKey: (recipientId: number) => TRecipientColor;

  renderError: boolean;
  setRenderError: (renderError: boolean) => void;
  overrideSettings?: EnvelopeRenderOverrideSettings;
};

interface EnvelopeRenderProviderProps {
  children: React.ReactNode;

  envelope: Pick<TEnvelope, 'id' | 'envelopeItems' | 'status' | 'type'>;

  /**
   * Optional fields which are passed down to renderers for custom rendering needs.
   *
   * Only pass if the CustomRenderer you are passing in wants fields.
   */
  fields?: Field[];

  /**
   * Optional recipient used to determine the color of the fields and hover
   * previews.
   *
   * Only required for generic page renderers.
   */
  recipients?: Pick<Recipient, 'id' | 'name' | 'email' | 'signingStatus'>[];

  /**
   * The token to access the envelope.
   *
   * If not provided, it will be assumed that the current user can access the document.
   */
  token: string | undefined;

  /**
   * Custom override settings for generic page renderers.
   */
  overrideSettings?: EnvelopeRenderOverrideSettings;
}

const EnvelopeRenderContext = createContext<EnvelopeRenderProviderValue | null>(null);

export const useCurrentEnvelopeRender = () => {
  const context = useContext(EnvelopeRenderContext);

  if (!context) {
    throw new Error('useCurrentEnvelopeRender must be used within a EnvelopeRenderProvider');
  }

  return context;
};

/**
 * Manages fetching envelope metadata and preloading page images.
 */
export const EnvelopeRenderProvider = ({
  children,
  envelope,
  fields,
  token,
  recipients = [],
  overrideSettings,
}: EnvelopeRenderProviderProps) => {
  const [envelopeItemsMeta, setEnvelopeItemsMeta] = useState<
    Record<string, TEnvelopeItemMetaWithDataId>
  >({});
  const [loadingState, setLoadingState] = useState<ImageLoadingState>('loading');
  const [renderError, setRenderError] = useState<boolean>(false);

  const envelopeItems = useMemo(
    () => envelope.envelopeItems.sort((a, b) => a.order - b.order),
    [envelope.envelopeItems],
  );

  const [currentItem, setCurrentItem] = useState<EnvelopeRenderItem | null>(
    envelope.envelopeItems[0] ?? null,
  );

  /**
   * Generate URL for a specific page image.
   */
  const getPageImageUrl = useCallback(
    (envelopeItemId: string, pageIndex: number): string => {
      const envelopeItem = envelope.envelopeItems.find((item) => item.id === envelopeItemId);
      const envelopeItemMeta = envelopeItemsMeta[envelopeItemId];
      const pageMeta = envelopeItemMeta?.pages[pageIndex];

      if (!envelopeItem) {
        console.error(`Envelope item not found: ${envelopeItemId}`);
        return '';
      }

      if (!pageMeta) {
        console.error(
          `Page meta not found for envelope item: ${envelopeItemId}, page: ${pageIndex}`,
        );
        return '';
      }

      return getEnvelopeItemPageImageUrl({
        envelopeItem: {
          id: envelopeItem.id,
          envelopeId: envelope.id,
        },
        documentDataId: pageMeta.currentDocumentDataId,
        pageIndex,
        token,
        version: 'current',
      });
    },
    [envelope.envelopeItems, envelope.id, envelopeItemsMeta, token],
  );

  const getPageData = useCallback(
    (envelopeItemId: string, pageIndex: number): PageRenderData => {
      const envelopeItemMeta = envelopeItemsMeta[envelopeItemId];
      const pageMeta = envelopeItemMeta?.pages[pageIndex];
      const pageImageUrl = getPageImageUrl(envelopeItemId, pageIndex);

      if (!pageMeta || !envelopeItemMeta || !pageImageUrl) {
        throw new Error('Page meta not found');
      }

      return {
        pageNumber: pageIndex + 1,
        pageIndex,
        pageWidth: pageMeta.width,
        pageHeight: pageMeta.height,
        scale: 1, // Todo: Render
        pageImageUrl,
        rotate: 0, // Todo: Render
      };
    },
    [envelope.envelopeItems, envelope.id],
  );

  /**
   * Preload initial images (first EAGER_LOAD_PAGE_COUNT pages) for all envelope items.
   * Returns a promise that resolves when initial images are loaded.
   */
  // const preloadInitialImages = useCallback(
  //   async (meta: Record<string, TEnvelopeItemMeta>): Promise<void> => {
  //     const imagePromises: Promise<void>[] = [];

  //     // Initialize page loading states for all pages
  //     const initialStates: PageLoadingStates = {};

  //     for (const [envelopeItemId, itemMeta] of Object.entries(meta)) {
  //       initialStates[envelopeItemId] = {};

  //       for (let pageIndex = 0; pageIndex < itemMeta.pageCount; pageIndex++) {
  //         // Mark first EAGER_LOAD_PAGE_COUNT pages as loading, rest as pending
  //         initialStates[envelopeItemId][pageIndex] =
  //           pageIndex < EAGER_LOAD_PAGE_COUNT ? 'loading' : 'pending';
  //       }
  //     }

  //     setPageLoadingStates(initialStates);

  //     // Only preload first EAGER_LOAD_PAGE_COUNT pages
  //     for (const [envelopeItemId, itemMeta] of Object.entries(meta)) {
  //       const pagesToLoad = Math.min(itemMeta.pageCount, EAGER_LOAD_PAGE_COUNT);

  //       for (let pageIndex = 0; pageIndex < pagesToLoad; pageIndex++) {
  //         const url = getPageImageUrl(envelopeItemId, pageIndex);

  //         if (!url) {
  //           continue;
  //         }

  //         const imagePromise = new Promise<void>((resolve) => {
  //           const img = new Image();

  //           img.onload = () => {
  //             setPageLoadingState(envelopeItemId, pageIndex, 'loaded');
  //             resolve();
  //           };

  //           img.onerror = () => {
  //             setPageLoadingState(envelopeItemId, pageIndex, 'error');
  //             // Don't reject - allow other images to continue loading
  //             resolve();
  //           };

  //           img.src = url;
  //         });

  //         imagePromises.push(imagePromise);
  //       }
  //     }

  //     await Promise.all(imagePromises);
  //   },
  //   [getPageImageUrl, setPageLoadingState],
  // );

  /**
   * Fetch metadata and preload initial images when the envelope or token changes.
   */
  useEffect(() => {
    void fetchEnvelopeRenderData();
  }, [envelope.id, envelope.envelopeItems.length, token]);

  const fetchEnvelopeRenderData = async () => {
    if (!envelope.id || envelope.envelopeItems.length === 0) {
      return;
    }

    setLoadingState('loading');

    try {
      // Fetch metadata for all envelope items
      const metaUrl = getEnvelopeMetaUrl({
        envelopeId: envelope.id,
        token,
      });

      const response = await fetch(metaUrl);

      if (!response.ok) {
        throw new Error(`Failed to fetch envelope meta: ${response.status}`);
      }

      const data = (await response.json()) as { envelopeItems: TEnvelopeItemMetaWithDataId[] };

      // Build a map of envelope items by ID
      const metaMap: Record<string, TEnvelopeItemMetaWithDataId> = {};

      for (const item of data.envelopeItems) {
        metaMap[item.id] = item;
      }

      setEnvelopeItemsMeta(metaMap);

      // Preload initial images (first EAGER_LOAD_PAGE_COUNT pages)
      // await preloadInitialImages(metaMap);

      setLoadingState('loaded');
    } catch (error) {
      console.error('Failed to load envelope data:', error);
      setLoadingState('error');
    }
  };

  const setCurrentEnvelopeItem = (envelopeItemId: string) => {
    const foundItem = envelope.envelopeItems.find((item) => item.id === envelopeItemId);

    setCurrentItem(foundItem ?? null);
  };

  // Set the selected item to the first item if none is set.
  useEffect(() => {
    if (currentItem && !envelopeItems.some((item) => item.id === currentItem.id)) {
      setCurrentItem(null);
    }

    if (!currentItem && envelopeItems.length > 0) {
      setCurrentEnvelopeItem(envelopeItems[0].id);
    }
  }, [currentItem, envelopeItems]);

  const recipientIds = useMemo(
    () => recipients.map((recipient) => recipient.id).sort(),
    [recipients],
  );

  const getRecipientColorKey = useCallback(
    (recipientId: number) => {
      const recipientIndex = recipientIds.findIndex((id) => id === recipientId);

      return AVAILABLE_RECIPIENT_COLORS[
        Math.max(recipientIndex, 0) % AVAILABLE_RECIPIENT_COLORS.length
      ];
    },
    [recipientIds],
  );

  return (
    <EnvelopeRenderContext.Provider
      value={{
        envelopeItemsMeta,
        loadingState,
        getPageImageUrl,
        getPageData,
        envelopeItems,
        envelopeStatus: envelope.status,
        envelopeType: envelope.type,
        currentEnvelopeItem: currentItem,
        setCurrentEnvelopeItem,
        fields: fields ?? [],
        recipients,
        getRecipientColorKey,
        renderError,
        setRenderError,
        overrideSettings,
      }}
    >
      {children}
    </EnvelopeRenderContext.Provider>
  );
};
