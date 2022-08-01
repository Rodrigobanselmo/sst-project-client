import * as Yup from 'yup';

export const subOfficeAutomateSchema = Yup.object().shape({
  name: Yup.string().required('Campo obrigatório'),
});
