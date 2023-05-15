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
  doneDateAsk?: Date;
  timeAsk?: string;
  time2?: string;
  name: string;
  id: number;
  scheduleId?: number;
  dueInDays?: number;
  scheduleRange?: Record<string, string>;
  status?: StatusEnum;
  clinic?: ICompany;
  isSelected?: boolean;
  scheduleType?: ClinicScheduleTypeEnum;
  isAttendance?: boolean;
  isAvaliation?: boolean;
  isToBlockDismissal?: boolean;
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
  company?: ICompany;
  companyId?: string;
  isPendingExams?: boolean;
  disabled?: boolean;
  handleDebounceChange?: DebouncedState<(value: any) => void>;
  scheduleData: {
    examType: ExamHistoryTypeEnum | undefined;
  };
  isLoadingTime?: boolean;
  getBlockTimeList?: {
    from: string;
    to: string;
  }[];
}
