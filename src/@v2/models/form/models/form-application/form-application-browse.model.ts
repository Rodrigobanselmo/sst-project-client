import { PaginationModel } from '@v2/models/.shared/models/pagination.model';
import { FormApplicationBrowseFilterModel } from './form-application-browse-filter.model';
import { FormApplicationBrowseResultModel } from './form-application-browse-result.model';

export type IFormApplicationBrowseModel = {
  pagination: PaginationModel;
  results: FormApplicationBrowseResultModel[];
  filters: FormApplicationBrowseFilterModel;
};

export class FormApplicationBrowseModel {
  results: FormApplicationBrowseResultModel[];
  pagination: PaginationModel;
  filters: FormApplicationBrowseFilterModel;

  constructor(params: IFormApplicationBrowseModel) {
    this.results = params.results.map(
      (result) => new FormApplicationBrowseResultModel(result),
    );
    this.pagination = new PaginationModel(params.pagination);
    this.filters = new FormApplicationBrowseFilterModel(params.filters);
  }
}
