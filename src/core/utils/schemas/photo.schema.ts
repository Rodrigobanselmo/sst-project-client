import * as yup from 'yup';

export const photoSchema = yup.object().shape({
  name: yup.string().trim().required('nome obrigatório'),
});
