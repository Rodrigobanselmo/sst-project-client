import * as yup from 'yup';

export const versionSchema = yup.object().shape({
  version: yup.string().trim().required('Dado obrigatório'),
  doc_name: yup.string().trim(),
  doc_description: yup.string().trim(),
});

export type IVersionSchema = Record<keyof typeof versionSchema, string>;
