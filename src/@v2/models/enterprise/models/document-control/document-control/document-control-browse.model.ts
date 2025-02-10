import { PaginationModel } from '@v2/models/@shared/models/pagination.model';
import { DocumentControlBrowseFilterModel } from './document-control-browse-filter.model';
import { DocumentControlBrowseResultModel } from './document-control-browse-result.model';

export type IDocumentControlBrowseModel = {
  pagination: PaginationModel;
  results: DocumentControlBrowseResultModel[];
  filters: DocumentControlBrowseFilterModel;
};

export class DocumentControlBrowseModel {
  results: DocumentControlBrowseResultModel[];
  pagination: PaginationModel;
  filters: DocumentControlBrowseFilterModel;

  constructor(params: IDocumentControlBrowseModel) {
    this.pagination = new PaginationModel(params.pagination);
    this.filters = new DocumentControlBrowseFilterModel(params.filters);
    this.results = params.results.map(
      (result) => new DocumentControlBrowseResultModel(result),
    );
  }
}
