import * as yup from 'yup';

export const characterizationSchema = yup.object().shape({
  name: yup.string().trim().required('nome obrigatório'),
  type: yup.string().trim().required('tipo obrigatório'),
  characterizationType: yup.string().trim().required('tipo obrigatório'),
  description: yup.string().trim(),
});
