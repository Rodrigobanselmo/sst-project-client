/* eslint-disable @typescript-eslint/no-explicit-any */
import IMask from 'imask';

import { masker } from './index';

const masked = {
  mask: 'num{,}cents',
  blocks: {
    num: {
      mask: Number,
      signed: true,
      thousandsSeparator: '.',
      mapToRadix: [''],
      scale: 0,
    },
    cents: {
      mask: '00',
      normalizeZeros: true,
      padFractionalZeros: true,
    },
  },
} as IMask.AnyMaskedOptions;

export const currencyCentsMask = masker(masked);
