import pMap from 'p-map';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import type { PDFDocumentProxy } from 'pdfjs-dist/types/src/display/api';
import { Canvas, Image, Path2D } from 'skia-canvas';

import type { TEnvelopeItemMeta } from '../../types/envelope-item-meta';

// @ts-expect-error napi-rs/canvas satisfies the requirements
globalThis.Path2D = Path2D;
// @ts-expect-error napi-rs/canvas satisfies the requirements
globalThis.Image = Image;

class SkiaCanvasFactory {
  _createCanvas(width: number, height: number) {
    const canvas = new Canvas(width, height);
    canvas.gpu = false;

    return canvas;
  }

  create(width: number, height: number) {
    const canvas = this._createCanvas(width, height);

    return {
      canvas,
      context: canvas.getContext('2d'),
    };
  }

  reset(canvasAndContext: { canvas: Canvas }, width: number, height: number) {
    canvasAndContext.canvas.width = width;
    canvasAndContext.canvas.height = height;
  }

  destroy(canvasAndContext: { canvas: Canvas | null; context: unknown }) {
    if (canvasAndContext.canvas) {
      canvasAndContext.canvas.width = 0;
      canvasAndContext.canvas.height = 0;
    }

    canvasAndContext.canvas = null;
    canvasAndContext.context = null;
  }
}

export type PdfToImagesOptions = {
  scale?: number;
};

export const pdfToImages = async (pdfBytes: Uint8Array, options: PdfToImagesOptions = {}) => {
  const { scale = 2 } = options;

  const task = await pdfjsLib.getDocument({
    data: pdfBytes,
    CanvasFactory: SkiaCanvasFactory,
  });

  const pdf = await task.promise;

  const images = await pMap(
    Array.from({ length: pdf.numPages }),
    async (_, pageIndex) => getPdfPageAsImage({ pdf, pageIndex, scale }),
    { concurrency: 10 },
  );

  void pdf.destroy().catch((e) => console.error(e));
  void task.destroy().catch((e) => console.error(e));

  return images;
};

export type PdfToImageOptions = {
  scale?: number;
  pageIndex: number;
};

export const pdfToImage = async (pdfBytes: Uint8Array, options: PdfToImageOptions) => {
  const { scale = 2, pageIndex } = options;

  if (pageIndex !== undefined && pageIndex < 0) {
    throw new Error('Page index must be greater than 0');
  }

  const task = await pdfjsLib.getDocument({
    data: pdfBytes,
    CanvasFactory: SkiaCanvasFactory,
  });

  const pdf = await task.promise;

  const image = await getPdfPageAsImage({ pdf, pageIndex, scale });

  void pdf.destroy().catch((e) => console.error(e));
  void task.destroy().catch((e) => console.error(e));

  return image;
};

export const getPdfDimensions = async (pdfBytes: Uint8Array) => {
  const task = pdfjsLib.getDocument({
    data: pdfBytes,
    CanvasFactory: SkiaCanvasFactory,
  });

  const pdf = await task.promise;

  try {
    const pages: TEnvelopeItemMeta['pages'] = [];

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      const page = await pdf.getPage(pageNumber);

      const viewport = page.getViewport({ scale: 1 });

      page.cleanup();

      pages.push({
        width: viewport.width,
        height: viewport.height,
      });
    }

    return pages;
  } finally {
    await pdf.destroy().catch((e) => console.error('Error destroying PDF:', e));
    await task.destroy().catch((e) => console.error('Error destroying task:', e));
  }
};

type GetPdfPageAsImageOptions = {
  pdf: PDFDocumentProxy;
  pageIndex: number;
  scale: number;
};

const getPdfPageAsImage = async ({ pdf, pageIndex, scale }: GetPdfPageAsImageOptions) => {
  const pageNumber = pageIndex + 1;
  const page = await pdf.getPage(pageNumber);

  const viewport = page.getViewport({ scale });

  const canvas = new Canvas(viewport.width, viewport.height);
  canvas.gpu = false;

  const canvasContext = canvas.getContext('2d');

  await page.render({
    // @ts-expect-error napi-rs/canvas satifies the requirements
    canvas,
    // @ts-expect-error napi-rs/canvas satifies the requirements
    canvasContext,
    viewport,
  }).promise;

  const result = {
    pageNumber,
    image: await canvas.toBuffer('jpeg'),
    width: Math.floor(viewport.width),
    height: Math.floor(viewport.height),
    mimeType: 'image/jpeg',
  };

  void page.cleanup();

  return result;
};
