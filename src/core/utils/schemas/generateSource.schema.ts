import * as Yup from 'yup';

export const generateSourceSchema = {
  name: Yup.string().required('Campo obrigatório'),
  recName: Yup.string().trim(),
  medName: Yup.string().trim(),
};

export type IGenerateSourceSchema = Record<
  keyof typeof generateSourceSchema,
  string
>;
