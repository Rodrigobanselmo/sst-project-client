import { StatusEnum } from 'project/enum/status.enum';

import { QuantityTypeEnum } from 'core/constants/maps/quantity-risks';
import { IEpi } from 'core/interfaces/api/IEpi';

import { IGho } from './IGho';
import { IHierarchy } from './IHierarchy';
import { IProfessional } from './IProfessional';
import { IGenerateSource, IRecMed } from './IRiskFactors';
import { IUser } from './IUser';

export interface IRiskDataJsonQui {
  stel?: string;
  twa?: string;
  nr15lt?: string;
  stelValue?: string;
  twaValue?: string;
  nr15ltValue?: string;
  type: QuantityTypeEnum;
}

export interface IRiskDataJsonNoise {
  ltcatq3?: string;
  ltcatq5?: string;
  nr15q3?: string;
  type: QuantityTypeEnum;
}
export interface IRiskData {
  id: string;
  probability?: number;
  probabilityAfter?: number;
  companyId: string;
  riskId: string;
  homogeneousGroupId?: string;
  hierarchyId?: string;
  riskFactorGroupDataId: string;
  hierarchy?: IHierarchy;
  homogeneousGroup?: IGho;
  generateSources?: IGenerateSource[];
  adms?: IRecMed[];
  recs?: IRecMed[];
  engs?: IRecMed[];
  epis?: IEpi[];
  json?: IRiskDataJsonQui | IRiskDataJsonNoise;
}

export interface IRiskGroupData {
  id: string;
  name: string;
  created_at: Date;
  companyId: string;
  status: StatusEnum;
  elaboratedBy?: string;
  revisionBy?: string;
  approvedBy?: string;
  source?: string;
  visitDate?: string;
  complementarySystems: string[];
  complementaryDocs: string[];
  coordinatorBy: string;
  validityEnd?: string;
  validityStart?: string;
  professionals?: IProfessional[];
  users?: IUser[];

  data?: IRiskData[];
}

export interface IPrgDocData {
  id: string;
  name: string;
  description: string;
  fileUrl: string;
  version: string;
  riskGroupId: string;
  created_at: Date;
  updated_at: Date;
  companyId: string;
  status: StatusEnum;
  workspaceId: string;
  workspaceName: string;
}
