import * as yup from 'yup';

export const addressSchema = yup.object().shape({
  cep: yup.string().trim().required('Dado obrigatório'),
  street: yup.string().trim(),
  neighborhood: yup.string().trim(),
  city: yup.string().trim(),
  state: yup.string().uppercase().trim(),
  number: yup.string().typeError('Número inválido'),
  complement: yup.string(),
});

export const addressClinicSchema = yup.object().shape({
  cep: yup.string().trim().required('Dado obrigatório'),
  street: yup.string().trim().required('Dado obrigatório'),
  neighborhood: yup.string().trim(),
  city: yup.string().trim().required('Dado obrigatório'),
  state: yup.string().uppercase().trim().required('Dado obrigatório'),
  number: yup.string().typeError('Número inválido'),
  complement: yup.string(),
});

export type IAddressSchema = Record<keyof typeof addressSchema, string>;
