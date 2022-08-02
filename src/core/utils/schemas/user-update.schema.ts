import * as Yup from 'yup';

export const userUpdateSchema = Yup.object().shape({
  name: Yup.string().required('Campo obrigatório'),
  cpf: Yup.string().required('Campo obrigatório'),
  type: Yup.string().required('Campo obrigatório'),
});
