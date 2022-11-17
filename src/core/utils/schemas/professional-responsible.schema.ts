import * as Yup from 'yup';

export const professionalResponsibleSchema = Yup.object().shape({
  startDate: Yup.string().trim().required('Campo obrigatório'),
});
