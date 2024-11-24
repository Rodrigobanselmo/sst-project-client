import { onlyNumbers } from '@brazilian-utils/brazilian-utils';
import { IStringTransformationType } from '../string-transformation';

export const maskOnlyNumber: IStringTransformationType = (value) => {
  return onlyNumbers(value);
};
