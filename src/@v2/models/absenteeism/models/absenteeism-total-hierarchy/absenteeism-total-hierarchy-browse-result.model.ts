import { AbsenteeismHierarchyTypeEnum } from '@v2/services/absenteeism/dashboard/browse-absenteeism-hierarchy/service/browse-absenteeism-hierarchy.service';

type Hierarchy = {
  id: string;
  name: string;
};

export type IAbsenteeismTotalHierarchyResultBrowseModel = {
  total: number;
  totalDays: number;
  averageDays: number;
  WORKSPACE: Hierarchy;
  DIRECTORY?: Hierarchy;
  MANAGEMENT?: Hierarchy;
  SECTOR?: Hierarchy;
  SUB_SECTOR?: Hierarchy;
  OFFICE?: Hierarchy;
  SUB_OFFICE?: Hierarchy;
  HOMOGENEOUS_GROUP?: {
    id: string;
    name?: string;
  };
};

export class AbsenteeismTotalHierarchyResultBrowseModel {
  total: number;
  totalDays: number;
  averageDays: number;
  rate: string;

  WORKSPACE: Hierarchy;
  DIRECTORY?: Hierarchy;
  MANAGEMENT?: Hierarchy;
  SECTOR?: Hierarchy;
  SUB_SECTOR?: Hierarchy;
  OFFICE?: Hierarchy;
  SUB_OFFICE?: Hierarchy;
  HOMOGENEOUS_GROUP?: {
    id: string;
    name: string;
  };

  constructor(params: IAbsenteeismTotalHierarchyResultBrowseModel) {
    this.total = params.total;
    this.totalDays = params.totalDays;
    this.averageDays = params.averageDays;
    this.rate = (Number(this.averageDays) * 100).toFixed(1).padEnd(4, '0');

    this.WORKSPACE = params.WORKSPACE;
    this.DIRECTORY = params.DIRECTORY;
    this.MANAGEMENT = params.MANAGEMENT;
    this.SECTOR = params.SECTOR;
    this.SUB_SECTOR = params.SUB_SECTOR;
    this.OFFICE = params.OFFICE;
    this.SUB_OFFICE = params.SUB_OFFICE;
    this.HOMOGENEOUS_GROUP = params.HOMOGENEOUS_GROUP
      ? {
          id: params.HOMOGENEOUS_GROUP.id,
          name: params.HOMOGENEOUS_GROUP.name || 'Sem Grupo',
        }
      : undefined;
  }

  get availableList(): Hierarchy[] {
    return [
      this.HOMOGENEOUS_GROUP,
      this.WORKSPACE,
      this.MANAGEMENT,
      this.DIRECTORY,
      this.SECTOR,
      this.SUB_SECTOR,
      this.OFFICE,
      this.SUB_OFFICE,
    ].filter(Boolean) as Hierarchy[];
  }
}
