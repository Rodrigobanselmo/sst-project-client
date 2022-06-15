import * as yup from 'yup';

export const environmentSchema = yup.object().shape({
  name: yup.string().trim().required('nome obrigatório'),
  type: yup.string().trim().required('tipo obrigatório'),
  description: yup.string().trim(),
});
