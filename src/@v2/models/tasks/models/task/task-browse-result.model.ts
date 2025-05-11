import { dateUtils } from '@v2/utils/date-utils';

export type ITaskBrowseResultModel = {
  id: number;
  sequentialId: number;
  description: string;
  createdAt: Date;
  updatedAt: Date | undefined;
  endDate: Date | undefined;
  doneDate: Date | undefined;
  priority: number;

  parent: { name: string; id: number } | undefined;
  status: { name: string; color: string | undefined } | undefined;
  createdBy: { id: number; name: string; email: string };
  responsible: { id: number; name: string; email: string }[];
};

export class TaskBrowseResultModel {
  id: number;
  sequentialId: number;
  description: string;
  createdAt: Date;
  updatedAt?: Date;
  endDate?: Date;
  doneDate?: Date;
  priority: number;

  parent?: { name: string; id: number };
  status?: { name: string; color: string | undefined };
  createdBy: { id: number; name: string; email: string };
  responsible: { id: number; name: string; email: string }[];

  constructor(params: ITaskBrowseResultModel) {
    this.id = params.id;
    this.sequentialId = params.sequentialId;
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
    this.description = params.description;
    this.endDate = params.endDate;
    this.doneDate = params.doneDate;
    this.priority = params.priority;

    this.parent = params.parent;
    this.status = params.status;
    this.createdBy = params.createdBy;
    this.responsible = params.responsible;
  }

  get formattedCreatedAt() {
    return dateUtils(this.createdAt).format('DD/MM/YYYY');
  }

  get formattedUpdatedAt() {
    return this.updatedAt
      ? dateUtils(this.updatedAt).format('DD/MM/YYYY')
      : this.formattedCreatedAt;
  }

  get formattedEndDate() {
    return this.endDate
      ? dateUtils(this.endDate).format('DD/MM/YYYY')
      : 'SEM PRAZO';
  }
}
