import * as Yup from 'yup';

export const userManageSchema = Yup.object().shape({
  email: Yup.string()
    .email('e-mail mal formatado')
    .required('Campo obrigatório'),
});
