import * as Yup from 'yup';

export const userUpdateSchema = Yup.object().shape({
  name: Yup.string().required('Campo obrigatório'),
});
