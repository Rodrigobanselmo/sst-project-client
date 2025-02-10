import { FileAsync } from '@v2/types/file-async';
import * as yup from 'yup';
import { DocumentControlTypeEnum } from './constants/document-type.map';

export interface IDocumentControlFormFields {
  name: string;
  type: { value: string };
  typeText?: string;
  description?: string;
  startDate: Date | null;
  endDate: Date | null;
  file: FileAsync;
}

export const schemaDocumentControlForm = yup.object({
  name: yup.string().required('Nome é obrigatório'),
  description: yup.string().optional(),
  type: yup
    .object({
      value: yup.string().required('Campo Obrigatório'),
    })
    .required('Campo obrigatório'),
  typeText: yup.string().test({
    name: 'text-type',
    message: 'Tipo é obrigatório',
    exclusive: true,
    test: function (value) {
      if (this.parent.type?.value === DocumentControlTypeEnum.OTHER && !value)
        return false;
      return true;
    },
  }),
  startDate: yup.date().nullable().optional(),
  endDate: yup.date().nullable().optional(),
  file: yup.mixed().required('Arquivo é obrigatório'),
}) as any;

export const documentControlFormInitialValues = {
  file: null as unknown as FileAsync,
  startDate: null,
  endDate: null,
} as IDocumentControlFormFields;
