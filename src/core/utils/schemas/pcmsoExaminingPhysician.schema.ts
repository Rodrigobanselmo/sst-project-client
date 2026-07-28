import * as Yup from 'yup';

export const pcmsoExaminingPhysicianSchema = Yup.object().shape({
  notes: Yup.string()
    .trim()
    .max(500, 'Observações devem ter no máximo 500 caracteres')
    .nullable(),
  sortOrder: Yup.number().typeError('Ordem inválida').nullable(),
  status: Yup.string().nullable(),
});
