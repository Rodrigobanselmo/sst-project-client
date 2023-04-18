import { IAddress } from 'core/interfaces/api/ICompany';
import { IContact } from 'core/interfaces/api/IContact';

import { cepMask } from '../masks/cep.mask';

export const getAddressMain = (address?: IAddress) => {
  if (!address) return '';
  return `${address.street}, ${address.number} - ${address.neighborhood} ${address.complement}`;
};

export const getAddressCity = (address?: IAddress) => {
  if (!address) return '';
  return `${address.city} - ${address.state}, ${cepMask.mask(address.cep)}`;
};

export const getAddressCityState = (address?: IAddress) => {
  if (!address) return '';
  return `${address.city} - ${address.state}`;
};

export const getContactPhone = (contact?: IContact) => {
  if (!contact) return '';
  return `Tel: ${contact.phone}  ${
    contact.phone_1 ? `/ Tel2: ${contact.phone_1}` : ''
  }`;
};
