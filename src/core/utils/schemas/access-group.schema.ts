import * as Yup from 'yup';

export const accessGroupSchema = Yup.object().shape({
  name: Yup.string().trim().required('Campo obrigatório'),
  description: Yup.string().trim(),
});
