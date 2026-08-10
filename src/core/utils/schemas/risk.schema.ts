import * as Yup from 'yup';

const SEVERITY_REQUIRED_MESSAGE =
  'Defina a severidade do fator de risco antes de salvar.';

/** Severidade é obrigatória para todos os tipos no formulário de RiskFactor (1–5). */
export const riskSchema = {
  name: Yup.string().required('Campo obrigatório'),
  type: Yup.string().required('Campo obrigatório'),
  severity: Yup.number()
    .transform((value, originalValue) => {
      if (
        originalValue === '' ||
        originalValue === null ||
        originalValue === undefined
      ) {
        return undefined;
      }
      const parsed = Number(originalValue);
      return Number.isFinite(parsed) ? parsed : undefined;
    })
    .typeError(SEVERITY_REQUIRED_MESSAGE)
    .required(SEVERITY_REQUIRED_MESSAGE)
    .oneOf([1, 2, 3, 4, 5], SEVERITY_REQUIRED_MESSAGE),
  risk: Yup.string(),
  symptoms: Yup.string(),
};

export type IRiskSchema = Record<keyof typeof riskSchema, string> & {
  subType?: { id: string | ''; name: string };
};
