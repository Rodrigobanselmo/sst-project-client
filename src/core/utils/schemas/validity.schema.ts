import * as yup from 'yup';

/** Campos legados mantidos para compatibilidade com formulários antigos. */
export const validitySchema = yup.object().shape({
  validityYears: yup.number().min(0),
  validityMonths: yup.number().min(0).max(11),
});
