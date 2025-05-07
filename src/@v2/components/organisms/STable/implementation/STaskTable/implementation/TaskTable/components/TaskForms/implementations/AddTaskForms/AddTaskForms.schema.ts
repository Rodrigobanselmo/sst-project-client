import { ResponsibleBrowseResultModel } from '@v2/models/security/models/responsible/responsible-browse-result.model';
import * as yup from 'yup';

export interface IAddTaskFormsFields {
  description: string;
  priority: { value: number; label: string } | null;
  endDate: Date | null;
  responsible: {
    id: number;
    name: string;
    employeeId?: number;
    email: string;
  } | null;
  status: { id: number | null } | null;
}

export const schemaAddTaskForms = yup.object({
  description: yup.string().required('Campo é obrigatório'),
  priority: yup.object({ value: yup.number() }).nullable().optional(),
  status: yup.object({ id: yup.number().nullable() }).nullable().optional(),
  endDate: yup.date().nullable().optional(),
}) as any;

export const addTaskFormsInitialValues = {
  description: '',
  endDate: null,
  priority: null,
  responsible: null,
  status: null,
} as IAddTaskFormsFields;
