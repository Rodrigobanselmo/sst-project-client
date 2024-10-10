export type IStatusBrowseResultModel = {
  id: number;
  name: string;
  color?: string | null;
};

export class StatusBrowseResultModel {
  id: number;
  name: string;
  color?: string | null;

  constructor(params: IStatusBrowseResultModel) {
    this.id = params.id;
    this.name = params.name;
    this.color = params.color;
  }
}
