import {
  IPaginationModelConstructor,
  PaginationModel,
} from '@v2/models/.shared/models/pagination.model';
import {
  AbsenteeismTotalEmployeeResultBrowseModel,
  IAbsenteeismTotalEmployeeResultBrowseModel,
} from './absenteeism-total-employee-browse-result.model';

export type IAbsenteeismTotalEmployeeBrowseModel = {
  results: IAbsenteeismTotalEmployeeResultBrowseModel[];
  pagination: IPaginationModelConstructor;
};

export class AbsenteeismTotalEmployeeBrowseModel {
  results: AbsenteeismTotalEmployeeResultBrowseModel[];
  pagination: PaginationModel;

  constructor(params: IAbsenteeismTotalEmployeeBrowseModel) {
    this.results = params.results.map(
      (result) => new AbsenteeismTotalEmployeeResultBrowseModel(result),
    );
    this.pagination = new PaginationModel(params.pagination);
  }
}
