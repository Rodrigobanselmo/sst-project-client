export type IAbsenteeismDaysCountResultReadModel = {
  count: number;
  range: string;
};

export class AbsenteeismDaysCountResultReadModel {
  count: number;
  range: string;
  label: string;
  value: number;
  id: string;

  constructor(params: IAbsenteeismDaysCountResultReadModel) {
    this.count = params.count;
    this.range = params.range;
    this.id = params.range;
    this.label = `${params.range}`;
    this.value = params.count;
  }
}
