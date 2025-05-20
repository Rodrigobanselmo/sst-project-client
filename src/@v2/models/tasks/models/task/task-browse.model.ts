import { PaginationModel } from '@v2/models/.shared/models/pagination.model';
import { TaskBrowseFilterModel } from './task-browse-filter.model';
import {
  ITaskBrowseResultModel,
  TaskBrowseResultModel,
} from './task-browse-result.model';

export type ITaskBrowseModel = {
  results: ITaskBrowseResultModel[];
  pagination: PaginationModel;
  filters: TaskBrowseFilterModel;
};

export class TaskBrowseModel {
  results: TaskBrowseResultModel[];
  pagination: PaginationModel;
  filters: TaskBrowseFilterModel;

  constructor(params: ITaskBrowseModel) {
    this.results = params.results.map(
      (result) => new TaskBrowseResultModel(result),
    );
    this.pagination = new PaginationModel(params.pagination);
    this.filters = new TaskBrowseFilterModel(params.filters);
  }
}
