import * as Yup from 'yup';

export const generateSourceSchema = {
  name: Yup.string().required('Campo obrigatório'),
};

export type IGenerateSourceSchema = Record<
  keyof typeof generateSourceSchema,
  string
>;
