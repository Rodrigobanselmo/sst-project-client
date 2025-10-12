import { dateUtils } from '@v2/utils/date-utils';
import { RiskTypeEnum } from '../../enums/risk-type.enum';

export type IGenerateSourceBrowseResultModel = {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date | null;
  risk: {
    id: string;
    name: string;
    type: RiskTypeEnum;
  };
};

export class GenerateSourceBrowseResultModel {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date | null;
  risk: {
    id: string;
    name: string;
    type: RiskTypeEnum;
  };

  constructor(params: IGenerateSourceBrowseResultModel) {
    this.id = params.id;
    this.name = params.name;
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
    this.risk = params.risk;
  }

  get formatedCreatedAt() {
    return dateUtils(this.createdAt).format('DD/MM/YYYY');
  }

  get formatedUpdatedAt() {
    return this.updatedAt
      ? dateUtils(this.updatedAt).format('DD/MM/YYYY')
      : this.formatedCreatedAt;
  }
}
