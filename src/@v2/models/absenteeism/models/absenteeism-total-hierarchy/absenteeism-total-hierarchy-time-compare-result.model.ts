import { AbsenteeismHierarchyTypeEnum } from '@v2/services/absenteeism/dashboard/browse-absenteeism-hierarchy/service/browse-absenteeism-hierarchy.service';
import { dateUtils } from '@v2/utils/date-utils';

export type IAbsenteeismTotalHierarchyTimeCompareResultModel = {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  total: number;
  totalDays: number;
  averageDays: number;
};

export class AbsenteeismTotalHierarchyTimeCompareResultModel {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  total: number;
  totalDays: number;
  averageDays: number;

  constructor(params: IAbsenteeismTotalHierarchyTimeCompareResultModel) {
    this.id = params.id;
    this.name = params.name;
    this.startDate = new Date(params.startDate);
    this.endDate = new Date(params.endDate);
    this.total = params.total;
    this.totalDays = params.totalDays;
    this.averageDays = params.averageDays;
  }

  get rangeString(): string {
    const isFirstSemester = this.startDate.getMonth() < 6;
    return `${dateUtils(this.startDate).format('YYYY')}/${
      isFirstSemester ? '1' : '2'
    }`;
  }
}
