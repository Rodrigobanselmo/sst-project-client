import * as yup from 'yup';

/** Campos opcionais da aba Informações adicionais (PGR). */
export const pgrComplementarySchema = yup.object().shape({
  source: yup.string().trim(),
  visitDate: yup.string().trim(),
  months_period_level_2: yup.mixed(),
  months_period_level_3: yup.mixed(),
  months_period_level_4: yup.mixed(),
  months_period_level_5: yup.mixed(),
});
