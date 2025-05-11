import { IPopperStatusValue } from '@v2/components/organisms/SPopper/addons/SPopperStatus/SPopperStatus';
import * as yup from 'yup';

export interface IEditTaskFormFields {
  description: string;
  priority: { value: number; label: string } | null;
  endDate: Date | null;
  responsible: {
    id: number;
    name: string;
    employeeId?: number;
    email: string;
  } | null;
  status: IPopperStatusValue | null;
}

export const schemaEditTaskForm = yup.object({
  description: yup.string().required('Campo é obrigatório'),
  priority: yup.object({ value: yup.number() }),
  status: yup.object({ id: yup.number().nullable() }).nullable().optional(),
  endDate: yup.date().nullable().optional(),
}) as any;
