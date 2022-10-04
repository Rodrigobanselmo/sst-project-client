import * as Yup from 'yup';

export const documentSchema = Yup.object().shape({
  name: Yup.string().trim().required('Campo obrigatório'),
});
