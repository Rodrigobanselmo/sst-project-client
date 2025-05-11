import { PaginationModel } from '@v2/models/.shared/models/pagination.model';
import { TaskResponsibleBrowseResultModel } from './task-responsible-browse-result.model';
import { TaskResponsibleBrowseFilterModel } from './task-responsible-browse-filter.model';

export type ITaskResponsibleBrowseModel = {
  results: TaskResponsibleBrowseResultModel[];
  pagination: PaginationModel;
  filters: TaskResponsibleBrowseFilterModel;
};

export class TaskResponsibleBrowseModel {
  results: TaskResponsibleBrowseResultModel[];
  pagination: PaginationModel;
  filters: TaskResponsibleBrowseFilterModel;

  constructor(params: ITaskResponsibleBrowseModel) {
    this.results = params.results.map(
      (result) => new TaskResponsibleBrowseResultModel(result),
    );
    this.pagination = new PaginationModel(params.pagination);
    this.filters = new TaskResponsibleBrowseFilterModel(params.filters);
  }
}
