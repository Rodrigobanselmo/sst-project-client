import { AbsenteeismHierarchyTypeEnum } from '@v2/services/absenteeism/dashboard/browse-absenteeism-hierarchy/service/browse-absenteeism-hierarchy.service';

export type IAbsenteeismTotalHierarchyFilterBrowseModel = {
  types: AbsenteeismHierarchyTypeEnum[];
};

export class AbsenteeismTotalHierarchyFilterBrowseModel {
  types: AbsenteeismHierarchyTypeEnum[];

  constructor(params: IAbsenteeismTotalHierarchyFilterBrowseModel) {
    this.types = params.types;
  }
}
