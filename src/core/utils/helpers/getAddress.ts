import { IAddress } from 'core/interfaces/api/ICompany';

import { cepMask } from '../masks/cep.mask';

export const getAddressMain = (address?: IAddress) => {
  if (!address) return '';
  return `${address.street}, ${address.number} - ${address.neighborhood} ${address.complement}`;
};

export const getAddressCity = (address?: IAddress) => {
  if (!address) return '';
  return `${address.city} - ${address.state}, ${cepMask.mask(address.cep)}`;
};
