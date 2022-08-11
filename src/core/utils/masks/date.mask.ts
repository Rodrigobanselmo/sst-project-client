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

export const dayMasked = {
  mask: IMask.MaskedRange,
  from: 1,
  to: 31,
} as IMask.AnyMaskedOptions;

export const dateDayMask = masker(dayMasked);

export const timeMasked = {
  mask: 'HH:MM',
  blocks: {
    HH: {
      mask: IMask.MaskedRange,
      from: 0,
      to: 23,
      maxLength: 2,
    },
    MM: {
      mask: IMask.MaskedRange,
      from: 0,
      to: 59,
      maxLength: 2,
    },
  },
} as IMask.AnyMaskedOptions;

export const timeMask = masker(timeMasked);
