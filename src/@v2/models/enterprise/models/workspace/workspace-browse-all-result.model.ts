import { WorkspaceStatusEnum } from '../../enums/workspace-status.enum';

export class WorkspaceBrowseResultModel {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  status: WorkspaceStatusEnum;

  constructor(params: WorkspaceBrowseResultModel) {
    this.id = params.id;
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
    this.name = params.name;
    this.status = params.status;
  }
}
