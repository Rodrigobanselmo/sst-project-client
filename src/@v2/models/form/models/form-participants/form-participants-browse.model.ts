import {
  IPaginationModelConstructor,
  PaginationModel,
} from '@v2/models/.shared/models/pagination.model';
import {
  FormParticipantsBrowseResultModel,
  IFormParticipantsBrowseResultModel,
} from './form-participants-browse-result.model';

export type IFormParticipantsFilterSummary = {
  totalParticipants: number;
  respondedCount: number;
  notRespondedCount: number;
  responseRatePercent: number;
};

export type IFormParticipantsBrowseModel = {
  pagination: IPaginationModelConstructor;
  results: FormParticipantsBrowseResultModel[];
  filterSummary?: IFormParticipantsFilterSummary;
};

export class FormParticipantsBrowseModel {
  results: FormParticipantsBrowseResultModel[];
  pagination: PaginationModel;
  filterSummary: IFormParticipantsFilterSummary;

  constructor(params: IFormParticipantsBrowseModel) {
    this.results = params.results.map(
      (result) =>
        new FormParticipantsBrowseResultModel(
          result as IFormParticipantsBrowseResultModel,
        ),
    );
    this.pagination = new PaginationModel(params.pagination);
    const fs = params.filterSummary;
    const total = this.pagination.total;
    this.filterSummary = fs
      ? {
          totalParticipants: fs.totalParticipants,
          respondedCount: fs.respondedCount,
          notRespondedCount: fs.notRespondedCount,
          responseRatePercent: fs.responseRatePercent,
        }
      : {
          totalParticipants: total,
          respondedCount: 0,
          notRespondedCount: Math.max(0, total),
          responseRatePercent: 0,
        };
  }
}
