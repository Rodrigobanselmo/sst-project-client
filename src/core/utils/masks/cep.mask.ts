/* eslint-disable @typescript-eslint/no-explicit-any */
import IMask from 'imask';

import { masker } from './index';

export const masked = {
  mask: [
    {
      mask: '00000-000',
    },
  ],
} as IMask.AnyMaskedOptions;

export const cepMask = masker(masked);
