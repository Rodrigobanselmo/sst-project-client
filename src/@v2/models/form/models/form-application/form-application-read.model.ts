import { dateUtils } from '@v2/utils/date-utils';

export type IFormApplicationReadModel = {
  id: string;
  name: string;
  companyId: string;
  description: string | undefined;
  createdAt: Date;
  updatedAt: Date;
};

export class FormApplicationReadModel {
  id: string;
  companyId: string;
  name: string;
  description: string | undefined;
  createdAt: Date;
  updatedAt: Date;

  constructor(params: IFormApplicationReadModel) {
    this.id = params.id;
    this.companyId = params.companyId;
    this.name = params.name;
    this.description = params.description;
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
  }

  get formatCreatedAt() {
    return dateUtils(this.createdAt).format('DD/MM/YYYY');
  }

  get formatUpdatedAt() {
    return dateUtils(this.updatedAt).format('DD/MM/YYYY');
  }
}
