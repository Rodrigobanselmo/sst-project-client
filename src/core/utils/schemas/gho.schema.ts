import * as yup from 'yup';

export const ghoSchema = yup.object().shape({
  name: yup.string().trim().required('name obrigatório'),
  description: yup.string().trim(),
});

export type IGhoSchema = Record<keyof typeof ghoSchema, string>;
