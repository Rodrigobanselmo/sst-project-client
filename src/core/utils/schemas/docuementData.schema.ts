import * as yup from 'yup';

export const documentDataSchema = yup.object().shape({
  name: yup.string().trim().required('Dado obrigatório'),
  elaboratedBy: yup.string().trim().required('Dado obrigatório'),
  source: yup.string().trim(),
  visitDate: yup.string().trim(),
  revisionBy: yup.string().trim(),
  approvedBy: yup.string().trim(),
  coordinatorBy: yup.string().trim(),
});

export type IPgrSchema = Record<keyof typeof documentDataSchema, string>;
