import {
  IPaginationModelConstructor,
  PaginationModel,
} from '@v2/models/@shared/models/pagination.model';
import {
  CharacterizationBrowseFilterModel,
  ICharacterizationBrowseFilterModel,
} from './characterization-browse-filter.model';
import {
  CharacterizationBrowseResultModel,
  ICharacterizationBrowseResultModel,
} from './characterization-browse-result.model';

export type ICharacterizationBrowseModel = {
  results: ICharacterizationBrowseResultModel[];
  pagination: IPaginationModelConstructor;
  filters: ICharacterizationBrowseFilterModel;
};

export class CharacterizationBrowseModel {
  results: CharacterizationBrowseResultModel[];
  pagination: PaginationModel;
  filters: CharacterizationBrowseFilterModel;

  constructor(params: ICharacterizationBrowseModel) {
    this.results = params.results.map(
      (result) => new CharacterizationBrowseResultModel(result),
    );
    this.pagination = new PaginationModel(params.pagination);
    this.filters = new CharacterizationBrowseFilterModel(params.filters);
  }
}
