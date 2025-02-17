import { FileModel } from '@v2/models/@shared/models/file.model';
import { dateUtils } from '@v2/utils/date-utils';

export type IDocumentControlFileBrowseResultModel = {
  id: number;
  companyId: string;
  name: string;
  description?: string;
  endDate: Date | undefined;
  startDate: Date | undefined;
  file: FileModel;
};

export class DocumentControlFileBrowseResultModel {
  id: number;
  companyId: string;
  name: string;
  description?: string;
  endDate: Date | undefined;
  startDate: Date | undefined;
  file: FileModel;

  constructor(params: IDocumentControlFileBrowseResultModel) {
    this.id = params.id;
    this.companyId = params.companyId;
    this.name = params.name;
    this.description = params.description;
    this.endDate = params.endDate;
    this.startDate = params.startDate;
    this.file = new FileModel(params.file);
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
