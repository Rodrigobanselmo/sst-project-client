import { PaginationModel } from '@v2/models/.shared/models/pagination.model';
import { FormParticipantsBrowseResultModel } from './form-participants-browse-result.model';

export type IFormParticipantsBrowseModel = {
  pagination: PaginationModel;
  results: FormParticipantsBrowseResultModel[];
};

export class FormParticipantsBrowseModel {
  results: FormParticipantsBrowseResultModel[];
  pagination: PaginationModel;

  constructor(params: IFormParticipantsBrowseModel) {
    this.results = params.results.map(
      (result) => new FormParticipantsBrowseResultModel(result),
    );
    this.pagination = new PaginationModel(params.pagination);
  }
}
