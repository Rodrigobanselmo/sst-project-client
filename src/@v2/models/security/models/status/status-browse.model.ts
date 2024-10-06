import {
  IStatusBrowseResultModel,
  StatusBrowseResultModel,
} from './status-browse-result.model';

export type IStatusBrowseModel = {
  results: IStatusBrowseResultModel[];
};

export class StatusBrowseModel {
  results: StatusBrowseResultModel[];

  constructor(params: IStatusBrowseModel) {
    this.results = params.results.map(
      (result) => new StatusBrowseResultModel(result),
    );
  }
}
