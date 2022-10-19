import * as yup from 'yup';

export const pcmsoSchema = yup.object().shape({
  name: yup.string().trim().required('Dado obrigatório'),
  elaboratedBy: yup.string().trim().required('Dado obrigatório'),
  revisionBy: yup.string().trim(),
  approvedBy: yup.string().trim(),
});

export type IPcmsoSchema = Record<keyof typeof pcmsoSchema, string>;
