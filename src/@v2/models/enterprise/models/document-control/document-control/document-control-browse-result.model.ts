import { FileModel } from '@v2/models/.shared/models/file.model';
import { dateUtils } from '@v2/utils/date-utils';

export type IDocumentControlBrowseResultModel = {
  id: number;
  name: string;
  description: string | undefined;
  endDate: Date | undefined;
  startDate: Date | undefined;
  type: string;
  file: FileModel | undefined;
  createdAt: Date;
  updatedAt: Date;
};

export class DocumentControlBrowseResultModel {
  id: number;
  name: string;
  description: string | undefined;
  endDate: Date | undefined;
  startDate: Date | undefined;
  type: string;
  file: FileModel | undefined;
  createdAt: Date;
  updatedAt: Date;

  constructor(params: IDocumentControlBrowseResultModel) {
    this.id = params.id;
    this.name = params.name;
    this.description = params.description;
    this.endDate = params.endDate;
    this.startDate = params.startDate;
    this.type = params.type;
    this.file = params.file;
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
  }

  get formatedCreatedAt() {
    return dateUtils(this.createdAt).format('DD/MM/YYYY');
  }

  get formatedUpdatedAt() {
    return dateUtils(this.updatedAt).format('DD/MM/YYYY');
  }

  get formatedStartDate() {
    return this.startDate ? dateUtils(this.startDate).format('MM/YYYY') : null;
  }

  get formatedEndDate() {
    return this.endDate ? dateUtils(this.endDate).format('MM/YYYY') : null;
  }

  get isExpired() {
    return this.endDate ? dateUtils(this.endDate).isBefore(new Date()) : false;
  }
}
