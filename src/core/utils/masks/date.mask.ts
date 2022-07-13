/* eslint-disable @typescript-eslint/no-explicit-any */
import IMask from 'imask';

import { masker } from './index';

export const masked = {
  mask: 'DD/MM/YYYY',
  blocks: {
    DD: {
      mask: IMask.MaskedRange,
      from: 1,
      to: 31,
      maxLength: 2,
    },
    MM: {
      mask: IMask.MaskedRange,
      from: 1,
      to: 12,
      maxLength: 2,
    },
    YYYY: {
      mask: IMask.MaskedRange,
      to: new Date().getFullYear() + 10,
      from: 1900,
    },
  },
} as IMask.AnyMaskedOptions;

export const dateMask = masker(masked);

export const monthMasked = {
  mask: 'MM/YYYY',
  blocks: {
    MM: {
      mask: IMask.MaskedRange,
      from: 1,
      to: 12,
      maxLength: 2,
    },
    YYYY: {
      mask: IMask.MaskedRange,
      to: new Date().getFullYear() + 10,
      from: 1900,
    },
  },
} as IMask.AnyMaskedOptions;

export const dateMonthMask = masker(monthMasked);
