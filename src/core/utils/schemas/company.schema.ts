import * as yup from 'yup';

export const companySchema = yup.object().shape({
  name: yup.string().trim().required('nome obrigatório'),
  cnpj: yup.string().trim().required('cnpj obrigatório'),
  type: yup.string().trim().required('tipo obrigatório'),
  fantasy: yup.string().trim(),
  description: yup.string().trim(),
});

export type ICompanySchema = Record<keyof typeof companySchema, string>;
