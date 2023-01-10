import * as yup from 'yup';

export const scheduleBlockSchema = yup.object().shape({
  name: yup.string().trim().required('nome obrigatório'),
});
