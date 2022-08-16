import { sortNumber } from './number.sort';
import { sortString } from './string.sort';

export const sortFilter = function (
  a: any,
  b: any,
  order?: string,
  field?: string,
) {
  if (!field) return 0;
  const arrayA = field ? a[field] : a;
  const arrayB = field ? b[field] : b;

  if (Array.isArray(arrayA) && Array.isArray(arrayB)) {
    if (order === 'desc')
      //* is inverted asc with desc
      return sortString(
        (arrayA[0] ? arrayA[0]?.name || '' : 'zzz') || 'zzz',
        (arrayB[0] ? arrayB[0]?.name || '' : 'zzz') || 'zzz',
      );
    // return sortNumber(arrayA.length || 0, arrayB.length || 0);
    if (order === 'asc')
      //* is inverted asc with desc
      return sortString(
        (arrayB[0] ? arrayB[0]?.name || '' : '000') || '000',
        (arrayA[0] ? arrayA[0]?.name || '' : '000') || '000',
      );
    // return sortNumber(arrayB.length || 0, arrayA.length || 0);
  }

  if (order === 'asc') {
    return typeof arrayA === 'number' || typeof arrayB === 'number'
      ? sortNumber(arrayA || 0, arrayB || 0)
      : sortString(arrayA || '', arrayB || '');
  }

  if (order === 'desc') {
    return typeof arrayA === 'number' || typeof arrayB === 'number'
      ? sortNumber(arrayB || 0, arrayA || 0)
      : sortString(arrayB || '', arrayA || '');
  }
  return 0;
};
