import IMask from 'imask';

import { masker } from './index';

const maskedInitialCurrency = {
  mask: 'R$ num',
  blocks: {
    num: {
      mask: Number,
      signed: true,
      thousandsSeparator: '.',
      mapToRadix: [''],
      scale: 0,
    },
  },
} as IMask.AnyMaskedOptions;

const maskedInitialPadZerosCurrency = {
  mask: 'R$ num',
  blocks: {
    num: {
      mask: Number,
      thousandsSeparator: '.',
      scale: 2,
      normalizeZeros: true,
      radix: ',',
      mapToRadix: [','],
      padFractionalZeros: true,
    },
  },
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

  return `R$ ${addThousandSeparator(newValue)}`;
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

export const currencyMaskPadZeros = masker(maskedInitialPadZerosCurrency);

export const currencyMask = {
  ...masker(maskedInitialCurrency),
  apply,
  mask,
};
