import * as yup from 'yup';

export const documentDataSchema = yup.object().shape({
  name: yup.string().trim().required('Dado obrigatório'),
  doc_description: yup.string().trim().required('Dado obrigatório'),
  elaboratedBy: yup.string().trim().required('Dado obrigatório'),
  source: yup.string().trim(),
  visitDate: yup.string().trim(),
  revisionBy: yup.string().trim(),
  approvedBy: yup.string().trim(),
  coordinatorBy: yup.string().trim(),
  legalResponsibleBy: yup.string().trim(),
  versionFamily: yup
    .string()
    .oneOf(['test', 'official'])
    .required('Dado obrigatório'),
  version: yup.string().trim().required('Dado obrigatório'),
  documentCreatedAt: yup
    .date()
    .required('Dado obrigatório')
    .typeError('Data inválida'),
  documentDate: yup
    .date()
    .required('Dado obrigatório')
    .typeError('Data inválida'),
  validityYears: yup
    .number()
    .typeError('Informe um número válido')
    .min(0, 'Valor inválido')
    .required('Dado obrigatório'),
  validityMonths: yup
    .number()
    .typeError('Informe um número válido')
    .min(0, 'Valor inválido')
    .max(11, 'Máximo de 11 meses')
    .required('Dado obrigatório'),
});

export type IPgrSchema = Record<keyof typeof documentDataSchema, string>;
