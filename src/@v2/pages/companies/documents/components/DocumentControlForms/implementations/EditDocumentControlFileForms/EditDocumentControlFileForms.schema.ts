import * as yup from 'yup';
import { FileAsync } from '@v2/types/file-async';

export interface IEditDocumentControlFormFields {
  name: string;
  description?: string;
  startDate: Date | null;
  endDate: Date | null;
  file: FileAsync;
}

export const schemaEditDocumentControlForm = yup.object({
  name: yup.string().required('Nome é obrigatório'),
  description: yup.string().optional(),
  startDate: yup.date().nullable().optional(),
  endDate: yup.date().nullable().optional(),
  file: yup.mixed().required('Arquivo é obrigatório'),
}) as any;
