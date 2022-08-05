/* eslint-disable @typescript-eslint/no-explicit-any */
import IMask from 'imask';

import { masker } from './index';

export const masked = {
  mask: [
    {
      mask: '0000/0-00',
    },
  ],
} as IMask.AnyMaskedOptions;

export const cnaeMask = masker(masked);
