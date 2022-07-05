import * as yup from 'yup';

export const validitySchema = yup.object().shape({
  validityStart: yup
    .string()
    .trim()
    .required('Dado obrigatório')
    .length(7, 'Data inválida'),
  validityEnd: yup
    .string()
    .trim()
    .required('Dado obrigatório')
    .length(7, 'Data inválida'),
});
