import * as yup from 'yup';

export const examSchema = yup.object().shape({
  name: yup.string().trim().required('nome obrigatório'),
  type: yup.string().trim().required('tipo obrigatório'),
});

export const examRiskSchema = yup.object().shape({
  validityInMonths: yup.string().trim().required('campo obrigatório'),
});
