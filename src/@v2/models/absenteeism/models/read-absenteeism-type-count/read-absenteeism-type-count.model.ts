import {
  AbsenteeismTypeCountResultReadModel,
  IAbsenteeismTypeCountResultReadModel,
} from './read-absenteeism-type-count-result.model';

export type IAbsenteeismTypeCountReadModel = {
  results: IAbsenteeismTypeCountResultReadModel[];
};

export class AbsenteeismTypeCountReadModel {
  results: AbsenteeismTypeCountResultReadModel[];

  constructor(params: IAbsenteeismTypeCountReadModel) {
    this.results = params.results.map(
      (item) => new AbsenteeismTypeCountResultReadModel(item),
    );
  }
}
