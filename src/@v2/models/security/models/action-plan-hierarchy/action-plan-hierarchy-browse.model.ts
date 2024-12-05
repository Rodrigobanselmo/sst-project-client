import { PaginationModel } from '@v2/models/@shared/models/pagination.model';
import { ActionPlanHierarchyBrowseResultModel } from './action-plan-hierarchy-browse-result.model';

export type IActionPlanHierarchyBrowseModel = {
  results: ActionPlanHierarchyBrowseResultModel[];
  pagination: PaginationModel;
};

export class ActionPlanHierarchyBrowseModel {
  results: ActionPlanHierarchyBrowseResultModel[];
  pagination: PaginationModel;

  constructor(params: IActionPlanHierarchyBrowseModel) {
    this.results = params.results.map(
      (result) => new ActionPlanHierarchyBrowseResultModel(result),
    );
    this.pagination = new PaginationModel(params.pagination);
  }
}
