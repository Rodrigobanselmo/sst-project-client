import { PaginationModel } from '@v2/models/.shared/models/pagination.model';
import { CommentCreatorBrowseFilterModel } from './comment-creators-browse-filter.model';
import { CommentCreatorBrowseResultModel } from './comment-creators-browse-result.model';

export type ICommentCreatorBrowseModel = {
  results: CommentCreatorBrowseResultModel[];
  pagination: PaginationModel;
  filters: CommentCreatorBrowseFilterModel;
};

export class CommentCreatorBrowseModel {
  results: CommentCreatorBrowseResultModel[];
  pagination: PaginationModel;
  filters: CommentCreatorBrowseFilterModel;

  constructor(params: ICommentCreatorBrowseModel) {
    this.results = params.results.map(
      (result) => new CommentCreatorBrowseResultModel(result),
    );
    this.pagination = new PaginationModel(params.pagination);
    this.filters = new CommentCreatorBrowseFilterModel(params.filters);
  }
}
