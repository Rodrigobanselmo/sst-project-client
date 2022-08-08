import * as yup from 'yup';

export const clinicSchema = yup.object().shape({
  name: yup.string().trim().required('nome obrigatório'),
  cnpj: yup.string().trim(),
  fantasy: yup.string().trim().required('nome obrigatório'),
  email: yup.string().trim(),
  phone: yup.string().trim(),
});

export type IClinicSchema = Record<keyof typeof clinicSchema, string>;
