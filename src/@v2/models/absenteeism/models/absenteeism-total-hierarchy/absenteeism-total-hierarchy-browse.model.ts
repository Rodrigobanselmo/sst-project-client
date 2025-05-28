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
      acc = { ...acc, ...item };
      return acc;
    }, {} as AbsenteeismTotalHierarchyResultBrowseModel);

    return {
      WORKSPACE: !!result?.WORKSPACE,
      DIRECTORY: !!result?.DIRECTORY,
      MANAGEMENT: !!result?.MANAGEMENT,
      OFFICE: !!result?.OFFICE,
      SECTOR: !!result?.SECTOR,
      SUB_OFFICE: !!result?.SUB_OFFICE,
      SUB_SECTOR: !!result?.SUB_SECTOR,
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
