import { onlyNumbers } from '@brazilian-utils/brazilian-utils';
import clone from 'clone';
import dayjs from 'dayjs';

export const cleanObjectValues = (obj: Object) => {
  const copy = clone(obj) as any;
  Object.keys(copy).forEach((key) => {
    // if (copy[key] === undefined) delete copy[key];
    if (typeof copy[key] === 'string' && copy[key].match(/\d{4}-\d{2}-\d{2}/))
      copy[key] = new Date(copy[key]);
    if (!copy[key]) delete copy[key];
    if (typeof copy[key] === 'function') delete copy[key];

    if (key === 'cpf') copy[key] = onlyNumbers(copy[key]);
    if (key === 'cnpj') copy[key] = onlyNumbers(copy[key]);
    if (key === 'cep') copy[key] = onlyNumbers(copy[key]);
    if (key === 'cnae') copy[key] = onlyNumbers(copy[key]);
    if (key === 'cbo') copy[key] = onlyNumbers(copy[key]);
    if (key === 'cid') copy[key] = onlyNumbers(copy[key]);
    if (
      ['startDate', 'endDate', 'birthday'].includes(key) &&
      copy[key] instanceof Date
    )
      copy[key] = dayjs(copy[key]).format('DDMMYYYY');
  });

  return copy;
};

export const cleanObjectNullValues = (obj: Object) => {
  const copy = clone(obj) as any;
  Object.keys(copy).forEach((key) => {
    if (copy[key] == null || copy[key] == undefined) delete copy[key];
  });

  return copy;
};
