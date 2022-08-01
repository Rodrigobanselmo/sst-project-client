/* eslint-disable @typescript-eslint/no-explicit-any */
import IMask from 'imask';

import { masker } from './index';

const masked = {
  mask: Number,
  thousandsSeparator: '',
  radix: '',
  mapToRadix: [''],
  signed: false,
  max: 99999999,
} as IMask.AnyMaskedOptions;

const mask = (value: string) => {
  const newValue = value.replace(/[^0-9]/g, '');
  return newValue;
};

const apply = (
  e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement> | string,
) => {
  const unmasked = typeof e === 'string' ? e : e.target.value;

  const newValue = mask(unmasked);

  if (typeof e === 'string') {
    return newValue;
  }

  e.target.value = newValue;
};

export const intMask = { ...masker(masked), apply, mask };
