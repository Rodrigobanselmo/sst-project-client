import * as Yup from 'yup';

export const riskSchema = {
  name: Yup.string().required('Campo obrigatório'),
  type: Yup.string(),
};

export type IRiskSchema = Record<keyof typeof riskSchema, string>;
