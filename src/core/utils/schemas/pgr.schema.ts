import * as yup from 'yup';

export const pgrSchema = yup.object().shape({
  name: yup.string().trim().required('Dado obrigatório'),
  elaboratedBy: yup.string().trim().required('Dado obrigatório'),
  source: yup.string().trim().required('Dado obrigatório'),
  visitDate: yup.string().trim().required('Dado obrigatório'),
  revisionBy: yup.string().trim(),
  approvedBy: yup.string().trim(),
});

export type IPgrSchema = Record<keyof typeof pgrSchema, string>;
