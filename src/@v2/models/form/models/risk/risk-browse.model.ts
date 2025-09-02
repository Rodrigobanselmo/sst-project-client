import { PaginationModel } from '@v2/models/.shared/models/pagination.model';
import {
  IRiskBrowseResultModel,
  RiskBrowseResultModel,
} from './risk-browse-result.model';

export interface IRiskBrowseModel {
  results: IRiskBrowseResultModel[];
  pagination: PaginationModel;
}

export class RiskBrowseModel {
  results: RiskBrowseResultModel[];
  pagination: PaginationModel;

  constructor(data: IRiskBrowseModel) {
    this.results = data.results.map((risk) => new RiskBrowseResultModel(risk));
    this.pagination = new PaginationModel(data.pagination);
  }
}
