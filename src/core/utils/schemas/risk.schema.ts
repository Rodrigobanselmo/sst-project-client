import * as Yup from 'yup';

export const riskSchema = {
  name: Yup.string().required('Campo obrigatório'),
  type: Yup.string().required('Campo obrigatório'),
  severity: Yup.number().required('Campo obrigatório'),
  risk: Yup.string(),
  symptoms: Yup.string(),
};

export type IRiskSchema = Record<keyof typeof riskSchema, string> & {
  subType?: { id: string | ''; name: string };
};
