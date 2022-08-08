import * as yup from 'yup';

export const clinicExamsSchema = yup.object().shape({
  // exam: yup.string().trim().required('exame obrigatório'),
  type: yup.string().trim().required('tipo obrigatório'),
});

export type IEmployeeSchema = Record<keyof typeof clinicExamsSchema, string>;
