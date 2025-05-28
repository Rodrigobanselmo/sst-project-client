export type IAbsenteeismTypeCountResultReadModel = {
  count: number;
  type: string;
};

export class AbsenteeismTypeCountResultReadModel {
  count: number;
  type: string;
  label: string;
  value: number;
  id: string;

  constructor(params: IAbsenteeismTypeCountResultReadModel) {
    this.count = params.count;
    this.type = params.type;
    this.id = params.type;
    this.label = params.type;
    this.value = params.count;
  }
}
