import { PDF } from '@libpdf/core';

import { AppError } from '../../errors/app-error';
import { AppErrorCode } from '../../errors/app-error';

export const normalizePdf = async (
  pdf: Buffer,
  options: { flattenForm?: boolean; password?: string } = {},
) => {
  const shouldFlattenForm = options.flattenForm ?? true;
  const password = options.password;

  const pdfDoc = await PDF.load(pdf).catch((e) => {
    console.error(`PDF normalization error: ${e.message}`);

    throw new AppError('INVALID_DOCUMENT_FILE', {
      message: 'The document is not a valid PDF',
    });
  });

  if (pdfDoc.isEncrypted) {
    if (!password) {
      throw new AppError(AppErrorCode.PDF_PASSWORD_REQUIRED, {
        message: 'This PDF is password-protected and requires a password to open',
      });
    }

    try {
      await pdfDoc.authenticate(password);
    } catch (error) {
      console.error('PDF password authentication failed:', error);
      throw new AppError(AppErrorCode.PDF_WRONG_PASSWORD, {
        message: 'The provided password is incorrect',
      });
    }
  }

  pdfDoc.flattenLayers();

  const form = pdfDoc.getForm();

  if (shouldFlattenForm && form) {
    form.flatten();
    pdfDoc.flattenAnnotations();
  }

  return Buffer.from(await pdfDoc.save());
};
