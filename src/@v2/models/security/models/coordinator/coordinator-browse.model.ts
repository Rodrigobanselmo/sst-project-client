import { PaginationModel } from '@v2/models/.shared/models/pagination.model';
import { CoordinatorBrowseFilterModel } from './coordinator-browse-filter.model';
import { CoordinatorBrowseResultModel } from './coordinator-browse-result.model';

export type ICoordinatorBrowseModel = {
  results: CoordinatorBrowseResultModel[];
  pagination: PaginationModel;
  filters: CoordinatorBrowseFilterModel;
};

export class CoordinatorBrowseModel {
  results: CoordinatorBrowseResultModel[];
  pagination: PaginationModel;
  filters: CoordinatorBrowseFilterModel;

  constructor(params: ICoordinatorBrowseModel) {
    this.results = params.results.map(
      (result) => new CoordinatorBrowseResultModel(result),
    );
    this.pagination = new PaginationModel(params.pagination);
    this.filters = new CoordinatorBrowseFilterModel(params.filters);
  }
}
