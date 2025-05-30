import {
  IPaginationModelConstructor,
  PaginationModel,
} from '@v2/models/.shared/models/pagination.model';
import { AbsenteeismHierarchyTypeEnum } from '@v2/services/absenteeism/dashboard/browse-absenteeism-hierarchy/service/browse-absenteeism-hierarchy.service';
import {
  AbsenteeismTotalHierarchyResultBrowseModel,
  IAbsenteeismTotalHierarchyResultBrowseModel,
} from './absenteeism-total-hierarchy-browse-result.model';
import {
  AbsenteeismTotalHierarchyFilterBrowseModel,
  IAbsenteeismTotalHierarchyFilterBrowseModel,
} from './absenteeism-total-hierarchy-browse-filter.model';

export type IAbsenteeismTotalHierarchyBrowseModel = {
  results: IAbsenteeismTotalHierarchyResultBrowseModel[];
  pagination: IPaginationModelConstructor;
  filters: IAbsenteeismTotalHierarchyFilterBrowseModel;
};

export class AbsenteeismTotalHierarchyBrowseModel {
  results: AbsenteeismTotalHierarchyResultBrowseModel[];
  pagination: PaginationModel;
  filters: AbsenteeismTotalHierarchyFilterBrowseModel;

  constructor(params: IAbsenteeismTotalHierarchyBrowseModel) {
    this.results = params.results.map(
      (result) => new AbsenteeismTotalHierarchyResultBrowseModel(result),
    );
    this.pagination = new PaginationModel(params.pagination);
    this.filters = new AbsenteeismTotalHierarchyFilterBrowseModel(
      params.filters,
    );
  }

  get typeMap(): Record<AbsenteeismHierarchyTypeEnum, boolean> {
    const result = this.results.reduce((acc, item) => {
      acc = new AbsenteeismTotalHierarchyResultBrowseModel({
        ...acc,
        ...item,
        WORKSPACE: item.WORKSPACE || acc.WORKSPACE,
        DIRECTORY: item.DIRECTORY || acc.DIRECTORY,
        MANAGEMENT: item.MANAGEMENT || acc.MANAGEMENT,
        SECTOR: item.SECTOR || acc.SECTOR,
        SUB_SECTOR: item.SUB_SECTOR || acc.SUB_SECTOR,
        OFFICE: item.OFFICE || acc.OFFICE,
        SUB_OFFICE: item.SUB_OFFICE || acc.SUB_OFFICE,
        HOMOGENEOUS_GROUP: item.HOMOGENEOUS_GROUP || acc.HOMOGENEOUS_GROUP,
      });
      return acc;
    }, {} as AbsenteeismTotalHierarchyResultBrowseModel);

    return {
      WORKSPACE: !!result?.WORKSPACE,
      DIRECTORY: !!result?.DIRECTORY,
      MANAGEMENT: !!result?.MANAGEMENT,
      SECTOR: !!result?.SECTOR,
      SUB_SECTOR: !!result?.SUB_SECTOR,
      OFFICE: !!result?.OFFICE,
      SUB_OFFICE: !!result?.SUB_OFFICE,
      HOMOGENEOUS_GROUP: !!result?.HOMOGENEOUS_GROUP,
    };
  }

  get typeList(): AbsenteeismHierarchyTypeEnum[] {
    return this.filters.types.filter(
      (item) =>
        ![
          AbsenteeismHierarchyTypeEnum.SUB_OFFICE,
          AbsenteeismHierarchyTypeEnum.SUB_SECTOR,
        ].includes(item),
    );
  }
}
