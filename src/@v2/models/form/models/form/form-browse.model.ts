import { PaginationModel } from '@v2/models/@shared/models/pagination.model';
import { FormBrowseFilterModel } from './form-browse-filter.model';
import { FormBrowseResultModel } from './form-browse-result.model';

export type IFormBrowseModel = {
  pagination: PaginationModel;
  results: FormBrowseResultModel[];
  filters: FormBrowseFilterModel;
};

export class FormBrowseModel {
  results: FormBrowseResultModel[];
  pagination: PaginationModel;
  filters: FormBrowseFilterModel;

  constructor(params: IFormBrowseModel) {
    this.pagination = new PaginationModel(params.pagination);
    this.filters = new FormBrowseFilterModel(params.filters);
    this.results = params.results.map(
      (result) => new FormBrowseResultModel(result),
    );
  }
}
