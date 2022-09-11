import * as yup from 'yup';

export const examScheduleSchema = yup.object().shape({
  examType: yup.string().trim().required('tipo obrigatório'),
});
