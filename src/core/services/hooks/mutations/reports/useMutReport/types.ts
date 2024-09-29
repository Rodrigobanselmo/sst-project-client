import { ReportDownloadtypeEnum } from 'components/atoms/STable/components/STableFilter/STableFilterBox/constants/report-type.constants';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';

export enum ReportTypeEnum {
  CLINICS,
  EXPIRED_EXAM,
  COMPLEMENTARY_EXAM,
  DONE_EXAM,
  CLOSE_EXPIRED_EXAM,
  RISK,
  CHARACTERIZATION,

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
  [ReportTypeEnum.CHARACTERIZATION]: {
    value: ReportTypeEnum.CHARACTERIZATION,
    route: ApiRoutesEnum.REPORT_CHARACTERIZATION,
  },
  [ReportTypeEnum.EXPIRED_EXAM]: {
    value: ReportTypeEnum.EXPIRED_EXAM,
    route: ApiRoutesEnum.REPORT_EXPIRED_EXAM,
  },
  [ReportTypeEnum.CLOSE_EXPIRED_EXAM]: {
    value: ReportTypeEnum.CLOSE_EXPIRED_EXAM,
    route: ApiRoutesEnum.REPORT_EXPIRED_EXAM,
  },
  [ReportTypeEnum.RISK]: {
    value: ReportTypeEnum.RISK,
    route: ApiRoutesEnum.REPORT_RISK,
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
  [ReportTypeEnum.COMPLEMENTARY_EXAM]: {
    value: ReportTypeEnum.COMPLEMENTARY_EXAM,
    route: ApiRoutesEnum.REPORT_COMPLEMENTARY_EXAM,
  },
};
