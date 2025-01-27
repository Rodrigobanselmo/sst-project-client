import * as Yup from 'yup';

export const userManageSchema = Yup.object().shape({
  name: Yup.string().trim().required('nome é obrigatório'),
  email: Yup.string().trim().email('e-mail mal formatado'),
});
