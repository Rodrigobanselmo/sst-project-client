import {
  IPaginationModelConstructor,
  PaginationModel,
} from '@v2/models/.shared/models/pagination.model';
import {
  GenerateSourceBrowseResultModel,
  IGenerateSourceBrowseResultModel,
} from './generate-source-browse-result.model';

export type IGenerateSourceBrowseModel = {
  results: IGenerateSourceBrowseResultModel[];
  pagination: IPaginationModelConstructor;
};

export class GenerateSourceBrowseModel {
  results: GenerateSourceBrowseResultModel[];
  pagination: PaginationModel;

  constructor(params: IGenerateSourceBrowseModel) {
    this.results = params.results.map(
      (result) => new GenerateSourceBrowseResultModel(result),
    );
    this.pagination = new PaginationModel(params.pagination);
  }
}
