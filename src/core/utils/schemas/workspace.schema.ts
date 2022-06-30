import * as yup from 'yup';

export const workspaceSchema = yup.object().shape({
  name: yup.string().trim().required('nome obrigatório'),
  description: yup.string().trim(),
  cep: yup.string().trim().required('Dado obrigatório'),
  street: yup.string().trim().required('Dado obrigatório'),
  neighborhood: yup.string().trim().required('Dado obrigatório'),
  city: yup.string().trim().required('Dado obrigatório'),
  state: yup.string().trim().required('Dado obrigatório'),
  complement: yup.string(),
  number: yup.string().trim().required('Dado obrigatório'),
});

export type IWorkspaceSchema = Record<keyof typeof workspaceSchema, string>;
