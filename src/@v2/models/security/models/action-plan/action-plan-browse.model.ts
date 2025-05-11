import {
  IPaginationModelConstructor,
  PaginationModel,
} from '@v2/models/.shared/models/pagination.model';
import {
  ActionPlanBrowseFilterModel,
  IActionPlanBrowseFilterModel,
} from './action-plan-browse-filter.model';
import {
  ActionPlanBrowseResultModel,
  IActionPlanBrowseResultModel,
} from './action-plan-browse-result.model';

export type IActionPlanBrowseModel = {
  results: IActionPlanBrowseResultModel[];
  pagination: IPaginationModelConstructor;
  filters: IActionPlanBrowseFilterModel;
};

export class ActionPlanBrowseModel {
  results: ActionPlanBrowseResultModel[];
  pagination: PaginationModel;
  filters: ActionPlanBrowseFilterModel;

  constructor(params: IActionPlanBrowseModel) {
    this.results = params.results.map(
      (result) => new ActionPlanBrowseResultModel(result),
    );
    this.pagination = new PaginationModel(params.pagination);
    this.filters = new ActionPlanBrowseFilterModel(params.filters);
  }
}
