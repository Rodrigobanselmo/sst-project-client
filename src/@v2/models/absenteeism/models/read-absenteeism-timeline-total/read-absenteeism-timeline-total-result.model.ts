export type IAbsenteeismTimelineTotalResultReadModel = {
  date: Date;
  documents: number;
  days: number;
};

export class AbsenteeismTimelineTotalResultReadModel {
  date: Date;
  documents: number;
  days: number;
  month: number;
  year: number;

  constructor(params: IAbsenteeismTimelineTotalResultReadModel) {
    this.date = new Date(params.date);
    this.documents = params.documents;
    this.days = params.days;
    this.month = this.date.getMonth() + 1;
    this.year = this.date.getFullYear();
  }
}
