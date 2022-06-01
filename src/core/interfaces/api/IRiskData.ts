import { StatusEnum } from 'project/enum/status.enum';

import { IEpi } from 'core/interfaces/api/IEpi';

import { IGho } from './IGho';
import { IHierarchy } from './IHierarchy';
import { IGenerateSource, IRecMed } from './IRiskFactors';

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
}

export interface IRiskGroupData {
  id: string;
  name: string;
  created_at: Date;
  companyId: string;
  workspaceId: string;
  status: StatusEnum;
  elaboratedBy?: string;
  revisionBy?: string;
  approvedBy?: string;
  source?: string;
  visitDate?: string;

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
}
