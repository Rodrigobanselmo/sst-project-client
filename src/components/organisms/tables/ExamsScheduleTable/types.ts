import { Control, FieldValues, UseFormSetValue } from 'react-hook-form';

import { BoxProps } from '@mui/material';
import dayjs from 'dayjs';
import { ExamHistoryTypeEnum } from 'project/enum/employee-exam-history-type.enum';
import { StatusEnum } from 'project/enum/status.enum';
import { DebouncedState } from 'use-debounce/lib/useDebouncedCallback';

import { ICompany } from 'core/interfaces/api/ICompany';
import { ClinicScheduleTypeEnum } from 'core/interfaces/api/IExam';

export interface IExamsScheduleTable {
  doneDate?: Date;
  time?: string;
  name: string;
  id: number;
  dueInDays?: number;
  scheduleRange?: Record<string, string>;
  status?: StatusEnum;
  clinic?: ICompany;
  isSelected?: boolean;
  scheduleType?: ClinicScheduleTypeEnum;
  isAttendance?: boolean;
  validityInMonths?: number;
  expiredDate?: Date | null;
  closeToExpired?: boolean;
}

export interface IExamsScheduleTableProps extends BoxProps {
  data?: IExamsScheduleTable[];
  setData?: (data: Partial<IExamsScheduleTable>) => void;
  setClinicData?: (data: Partial<IExamsScheduleTable>) => void;
  control: Control<FieldValues, object>;
  setValue: UseFormSetValue<FieldValues>;
  lastComplementaryDate?: dayjs.Dayjs;
  hideHeader?: boolean;
  hideInstruct?: boolean;
  handleDebounceChange?: DebouncedState<(value: any) => void>;
  scheduleData: {
    examType: ExamHistoryTypeEnum | undefined;
  };
}
