export type ITaskResponsibleBrowseResultModel = {
  id?: number;
  employeeId?: number;
  name: string;
  email: string;
};

export class TaskResponsibleBrowseResultModel {
  id?: number;
  employeeId?: number;
  name: string;
  email: string;

  constructor(params: ITaskResponsibleBrowseResultModel) {
    this.id = params.id;
    this.employeeId = params.employeeId;
    this.name = params.name;
    this.email = params.email;
  }

  get _id() {
    return `${this.id}-${this.employeeId}`;
  }
}
