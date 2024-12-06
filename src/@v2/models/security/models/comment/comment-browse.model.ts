import { PaginationModel } from '@v2/models/@shared/models/pagination.model';
import { CommentBrowseFilterModel } from './comment-browse-filter.model';
import { CommentBrowseResultModel } from './comment-browse-result.model';

export type ICommentBrowseModel = {
  results: CommentBrowseResultModel[];
  pagination: PaginationModel;
  filters: CommentBrowseFilterModel;
};

export class CommentBrowseModel {
  results: CommentBrowseResultModel[];
  pagination: PaginationModel;
  filters: CommentBrowseFilterModel;

  constructor(params: ICommentBrowseModel) {
    this.results = params.results.map(
      (result) => new CommentBrowseResultModel(result),
    );
    this.pagination = new PaginationModel(params.pagination);
    this.filters = new CommentBrowseFilterModel(params.filters);
  }
}
