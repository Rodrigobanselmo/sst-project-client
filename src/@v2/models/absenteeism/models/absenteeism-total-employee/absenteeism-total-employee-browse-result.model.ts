export type IAbsenteeismTotalEmployeeResultBrowseModel = {
  id: number;
  name: string;
};

export class AbsenteeismTotalEmployeeResultBrowseModel {
  id: number;
  name: string;

  constructor(params: IAbsenteeismTotalEmployeeResultBrowseModel) {
    this.id = params.id;
    this.name = params.name;
  }
}
