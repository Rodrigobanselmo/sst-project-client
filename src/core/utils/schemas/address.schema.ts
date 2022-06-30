import * as yup from 'yup';

export const addressSchema = yup.object().shape({
  cep: yup.string().trim().required('Dado obrigatório'),
  street: yup.string().trim(),
  neighborhood: yup.string().trim(),
  city: yup.string().trim(),
  state: yup.string().uppercase().trim(),
  number: yup.string(),
  complement: yup.string(),
});

export type IAddressSchema = Record<keyof typeof addressSchema, string>;
