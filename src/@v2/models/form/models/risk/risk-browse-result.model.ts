export interface IRiskBrowseResultModel {
  id: string;
  name: string;
  severity: number;
  type: string;
}

export class RiskBrowseResultModel {
  id: string;
  name: string;
  severity: number;
  type: string;

  constructor(data: IRiskBrowseResultModel) {
    this.id = data.id;
    this.name = data.name;
    this.severity = data.severity;
    this.type = data.type;
  }
}
