import { PaginationModel } from '@v2/models/.shared/models/pagination.model';
import { TaskBrowseFilterModel } from './task-browse-filter.model';
import { TaskBrowseResultModel } from './task-browse-result.model';

export type ITaskBrowseModel = {
  results: TaskBrowseResultModel[];
  pagination: PaginationModel;
  filters: TaskBrowseFilterModel;
};

export class TaskBrowseModel {
  results: TaskBrowseResultModel[];
  pagination: PaginationModel;
  filters: TaskBrowseFilterModel;

  constructor(params: ITaskBrowseModel) {
    this.results = params.results;
    this.pagination = params.pagination;
    this.filters = params.filters;
  }
}
