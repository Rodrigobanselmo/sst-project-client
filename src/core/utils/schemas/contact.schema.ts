import * as Yup from 'yup';

export const contactSchema = Yup.object().shape({
  name: Yup.string().trim().required('Campo obrigatório'),
});
