/* eslint-disable @typescript-eslint/no-explicit-any */
import IMask from 'imask';

import { masker } from './index';

const masked = {
  mask: Number,
  thousandsSeparator: '.',
  radix: ',',
  mapToRadix: [','],
  signed: false,
  max: 99999999,
} as IMask.AnyMaskedOptions;

const mask = (value: string) => {
  const newValue = value.replace(/[^0-9]/g, '');

  if (newValue.length === 0) return '';

  const addThousandSeparator = (value: string): string => {
    let separatedValue = value;

    if (value.length <= 3) {
      return value;
    }

    if (value.length > 3) {
      separatedValue =
        value.substring(0, value.length - 3) +
        '.' +
        value.substring(value.length - 3);
    }

    if (separatedValue.split('.')[0].length > 3) {
      return `${addThousandSeparator(separatedValue.split('.')[0])}.${
        separatedValue.split('.')[1]
      }`;
    }

    return separatedValue;
  };

  return addThousandSeparator(newValue);
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

export const numberMask = { ...masker(masked), apply, mask };
