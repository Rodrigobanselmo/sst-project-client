import { FileAsync } from '@v2/types/file-async';
import * as yup from 'yup';

export interface IAddDocumentControlFormFileFields {
  name: string;
  description?: string;
  startDate: Date | null;
  endDate: Date | null;
  file: FileAsync;
}

export const schemaAddDocumentControlFileForm = yup.object({
  description: yup.string().optional(),
  startDate: yup.date().nullable().optional(),
  endDate: yup.date().nullable().optional(),
  file: yup.mixed().required('Arquivo é obrigatório'),
}) as any;

export const addDocumentControlFormFileInitialValues = {
  file: null as unknown as FileAsync,
  startDate: null,
  endDate: null,
} as IAddDocumentControlFormFileFields;
