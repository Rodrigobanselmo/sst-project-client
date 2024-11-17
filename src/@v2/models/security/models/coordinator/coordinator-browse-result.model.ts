export type ICoordinatorBrowseResultModel = {
  id: number;
  name: string;
  email: string;
};

export class CoordinatorBrowseResultModel {
  id: number;
  name: string;
  email: string;

  constructor(params: ICoordinatorBrowseResultModel) {
    this.id = params.id;
    this.name = params.name;
    this.email = params.email;
  }
}
