import { ReportDownloadtypeEnum } from 'components/atoms/STable/components/STableFilter/STableFilterBox/constants/report-type.constants';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';

export enum ReportTypeEnum {
  CLINICS,
  EXPIRED_EXAM,
  DONE_EXAM,
  CLOSE_EXPIRED_EXAM,

  MODEL_RISK,
  MODEL_EMPLOYEE,
}
type IMap = Record<
  ReportTypeEnum,
  {
    value: ReportTypeEnum;
    route: ApiRoutesEnum;
  }
>;

export interface IReportBase {
  companyId: string;
  companiesIds?: string[];
  companiesGroupIds?: string[];
  uf?: string[];
  cities?: string[];
  startDate?: Date;
  endDate?: Date;
  notInExamType?: string[];
  notInEvaluationType?: string[];

  downloadType?: ReportDownloadtypeEnum;
  type: ReportTypeEnum;
}

export const reportTypeMap: IMap = {
  [ReportTypeEnum.CLINICS]: {
    value: ReportTypeEnum.CLINICS,
    route: ApiRoutesEnum.REPORT_CLINIC,
  },
  [ReportTypeEnum.EXPIRED_EXAM]: {
    value: ReportTypeEnum.EXPIRED_EXAM,
    route: ApiRoutesEnum.REPORT_EXPIRED_EXAM,
  },
  [ReportTypeEnum.CLOSE_EXPIRED_EXAM]: {
    value: ReportTypeEnum.CLOSE_EXPIRED_EXAM,
    route: ApiRoutesEnum.REPORT_EXPIRED_EXAM,
  },
  [ReportTypeEnum.DONE_EXAM]: {
    value: ReportTypeEnum.DONE_EXAM,
    route: ApiRoutesEnum.REPORT_DONE_EXAM,
  },
  [ReportTypeEnum.MODEL_RISK]: {
    value: ReportTypeEnum.MODEL_RISK,
    route: ApiRoutesEnum.MODEL_RISK_DOWNALOD,
  },
  [ReportTypeEnum.MODEL_EMPLOYEE]: {
    value: ReportTypeEnum.MODEL_EMPLOYEE,
    route: ApiRoutesEnum.MODEL_EMPLOYEE_DOWNALOD,
  },
};
