/* eslint-disable @typescript-eslint/no-explicit-any */
import IMask from 'imask';

import { masker } from './index';

export const masked = {
  mask: [
    {
      mask: '000.000.000-00',
    },
  ],
} as IMask.AnyMaskedOptions;

export const cpfMask = masker(masked);
