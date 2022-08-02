import * as yup from 'yup';

export const professionalSchema = yup.object().shape({
  name: yup.string().trim().required('name obrigatório'),
  type: yup.string().trim().required('tipo de profissional obrigatório'),
});

export type IGhoSchema = Record<keyof typeof professionalSchema, string>;
