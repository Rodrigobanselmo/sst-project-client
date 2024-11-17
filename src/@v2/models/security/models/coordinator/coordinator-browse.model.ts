import { PaginationModel } from '@v2/models/@shared/models/pagination.model';
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
    this.results = params.results;
    this.pagination = params.pagination;
    this.filters = params.filters;
  }
}
