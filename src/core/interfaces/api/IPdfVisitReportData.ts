import { ExamHistoryTypeEnum } from 'project/enum/employee-exam-history-type.enum';

import { ICompany } from './ICompany';
import { IEmployee } from './IEmployee';

export interface IPdfVisitReportData {
  actualCompany: ICompany;
  consultantCompany: ICompany;
  empoyees: IEmployee[];
  doneDate: Date;
  totalSumExamsTypes?: number;
  sumExamsTypes: Record<ExamHistoryTypeEnum, number>;
}
