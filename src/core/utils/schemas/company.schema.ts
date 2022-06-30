import * as yup from 'yup';

export const companySchema = yup.object().shape({
  name: yup.string().trim().required('nome obrigatório'),
  cnpj: yup.string().trim().required('cnpj obrigatório'),
  type: yup.string().trim().required('tipo obrigatório'),
  email: yup.string().trim(),
  phone: yup.string().trim(),
  responsibleName: yup.string().trim(),
  fantasy: yup.string().trim(),
});

export type ICompanySchema = Record<keyof typeof companySchema, string>;
