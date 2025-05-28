import { AbsenteeismHierarchyTypeEnum } from '@v2/services/absenteeism/dashboard/browse-absenteeism-hierarchy/service/browse-absenteeism-hierarchy.service';

type Hierarchy = {
  id: string;
  name: string;
};

export type IAbsenteeismTotalHierarchyResultBrowseModel = {
  total: number;
  totalDays: number;
  averageDays: number;
  WORKSPACE?: Hierarchy;
  DIRECTORY?: Hierarchy;
  MANAGEMENT?: Hierarchy;
  SECTOR?: Hierarchy;
  SUB_SECTOR?: Hierarchy;
  OFFICE?: Hierarchy;
  SUB_OFFICE?: Hierarchy;
};

export class AbsenteeismTotalHierarchyResultBrowseModel {
  total: number;
  totalDays: number;
  averageDays: number;
  rate: string;

  WORKSPACE?: Hierarchy;
  DIRECTORY?: Hierarchy;
  MANAGEMENT?: Hierarchy;
  SECTOR?: Hierarchy;
  SUB_SECTOR?: Hierarchy;
  OFFICE?: Hierarchy;
  SUB_OFFICE?: Hierarchy;

  constructor(params: IAbsenteeismTotalHierarchyResultBrowseModel) {
    this.total = params.total;
    this.totalDays = params.totalDays;
    this.averageDays = params.averageDays;
    //! change 365 to num days selected
    this.rate = (Number(this.averageDays / 365) * 100)
      .toFixed(1)
      .padEnd(4, '0');

    this.WORKSPACE = params.WORKSPACE;
    this.DIRECTORY = params.DIRECTORY;
    this.MANAGEMENT = params.MANAGEMENT;
    this.SECTOR = params.SECTOR;
    this.SUB_SECTOR = params.SUB_SECTOR;
    this.OFFICE = params.OFFICE;
    this.SUB_OFFICE = params.SUB_OFFICE;
  }
}
