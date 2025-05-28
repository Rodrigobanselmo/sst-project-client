import {
  AbsenteeismTimelineTotalResultReadModel,
  IAbsenteeismTimelineTotalResultReadModel,
} from './read-absenteeism-timeline-total-result.model';

export type IAbsenteeismTimelineTotalReadModel = {
  results: IAbsenteeismTimelineTotalResultReadModel[];
};

export class AbsenteeismTimelineTotalReadModel {
  results: AbsenteeismTimelineTotalResultReadModel[];

  constructor(params: IAbsenteeismTimelineTotalReadModel) {
    this.results = params.results.map(
      (item) => new AbsenteeismTimelineTotalResultReadModel(item),
    );
  }
}
