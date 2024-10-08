/* eslint-disable @typescript-eslint/no-explicit-any */
import IMask from 'imask';

import { masker } from './index';

interface IFloatProps {
  max?: number;
  min?: number;
  decimal?: number;
  negative?: boolean;
  ltAccept?: boolean;
}

const masked = {
  mask: Number,
  thousandsSeparator: ' ',
  radix: ',',
  mapToRadix: [','],
  signed: false,
  max: 99999999,
} as IMask.AnyMaskedOptions;

const mask = (value: string, props?: IFloatProps) => {
  let signal = '';
  if (props?.ltAccept) {
    const firstLetter = value.substring(0, 1);
    if (firstLetter === '<') {
      value = value.slice(1, value.length);
      signal = '<';
    }
  }

  const firstLetter = value.substring(0, 1);
  const secondLetter = value.substring(1, 2);
  const isNegative = props?.negative && firstLetter == '-';

  if (firstLetter == '0' && secondLetter != ',')
    return signal + (isNegative ? '-' : '') + value.slice(0, 1);

  let newValue = '';

  if (props?.decimal === 0) {
    newValue = value.replace(/[^0-9]/g, '');
  } else {
    newValue = value.replace(/[^0-9,]/g, '');
  }

  if (newValue.length === 0 && !isNegative) return signal + '';

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

  const splitValues = newValue.split(',');

  const decimals =
    props?.decimal || (splitValues[1] ? splitValues[1]?.length : 0);

  if (value.substring(0, 1) == ',')
    return signal + (isNegative ? '-' : '') + '0,';

  return (
    signal +
    (isNegative ? '-' : '') +
    addThousandSeparator(splitValues[0]) +
    (splitValues[1] != undefined ? ',' + splitValues[1].slice(0, decimals) : '')
  );
};

const apply =
  (props?: IFloatProps) =>
  (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement> | string) => {
    if (typeof e !== 'string' && !e) return e;
    if (typeof e !== 'string' && !e.target?.value) return e;
    const unmasked = typeof e === 'string' ? e : e.target.value;

    const newValue = mask(unmasked, props);

    if (typeof e === 'string') {
      return newValue;
    }

    e.target.value = newValue;
  };

export const floatMask = { ...masker(masked), apply, mask };
