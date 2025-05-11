import { PaginationModel } from '@v2/models/.shared/models/pagination.model';
import { SubTypeBrowseResultModel } from './sub-type-browse-result.model';

export type ISubTypeBrowseModel = {
  pagination: PaginationModel;
  results: SubTypeBrowseResultModel[];
};

export class SubTypeBrowseModel {
  results: SubTypeBrowseResultModel[];
  pagination: PaginationModel;

  constructor(params: ISubTypeBrowseModel) {
    this.pagination = new PaginationModel(params.pagination);
    this.results = params.results.map(
      (result) => new SubTypeBrowseResultModel(result),
    );
  }
}
