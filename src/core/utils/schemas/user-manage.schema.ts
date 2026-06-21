import * as Yup from 'yup';

export const userManageSchema = Yup.object().shape({
  name: Yup.string().trim().required('nome é obrigatório'),
  email: Yup.string()
    .trim()
    .transform((value) => value || undefined)
    .optional()
    .email('e-mail mal formatado'),
});
