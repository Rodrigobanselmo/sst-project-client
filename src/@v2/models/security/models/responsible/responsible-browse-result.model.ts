export type IResponsibleBrowseResultModel = {
  userId?: number;
  employeeId?: number;
  name: string;
  email: string;
};

export class ResponsibleBrowseResultModel {
  userId?: number;
  employeeId?: number;
  name: string;
  email: string;

  constructor(params: IResponsibleBrowseResultModel) {
    this.userId = params.userId;
    this.employeeId = params.employeeId;
    this.name = params.name;
    this.email = params.email;
  }

  get _id() {
    return `${this.userId}-${this.employeeId}`;
  }
}
