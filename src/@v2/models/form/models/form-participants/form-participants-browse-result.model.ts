import { HierarchyTypeEnum } from '@v2/models/security/enums/hierarchy-type.enum';
import { dateUtils } from '@v2/utils/date-utils';

type IHierarchy = {
  id: string;
  name: string;
  type: HierarchyTypeEnum;
};

export type IFormParticipantsBrowseResultModel = {
  id: number;
  name: string;
  cpf: string;
  email: string;
  status: string;
  companyId: string;
  hierarchyId: string;
  hierarchyName: string;
  hierarchies: IHierarchy[];
  hasResponded: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export class FormParticipantsBrowseResultModel {
  id: number;
  name: string;
  cpf: string;
  email: string;
  status: string;
  companyId: string;
  hierarchyId: string;
  hierarchyName: string;
  hierarchies: IHierarchy[];
  hasResponded: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(params: IFormParticipantsBrowseResultModel) {
    this.id = params.id;
    this.name = params.name;
    this.cpf = params.cpf;
    this.email = params.email;
    this.status = params.status;
    this.companyId = params.companyId;
    this.hierarchyId = params.hierarchyId;
    this.hierarchyName = params.hierarchyName;
    this.hierarchies = params.hierarchies;
    this.hasResponded = params.hasResponded;
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
  }

  get formattedCreatedAt() {
    return dateUtils(this.createdAt).format('DD/MM/YYYY');
  }

  get formattedUpdatedAt() {
    return dateUtils(this.updatedAt).format('DD/MM/YYYY');
  }
}
