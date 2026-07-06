import * as yup from 'yup';

export const examSchema = yup.object().shape({
  name: yup.string().trim().required('nome obrigatório'),
  type: yup.string().trim().required('tipo obrigatório'),
});

const PERIODIC_VALIDITY_MESSAGE =
  'Informe a periodicidade para exames periódicos';

export const examRiskSchema = yup.object().shape({
  isPeriodic: yup.boolean().optional(),
  validityInMonths: yup
    .string()
    .trim()
    .when('isPeriodic', {
      is: true,
      then: (schema) =>
        schema
          .required(PERIODIC_VALIDITY_MESSAGE)
          .test('positive-int', PERIODIC_VALIDITY_MESSAGE, (value) => {
            const parsed = parseInt(String(value ?? '').trim(), 10);
            return !Number.isNaN(parsed) && parsed > 0;
          }),
      otherwise: (schema) => schema.optional(),
    }),
});
