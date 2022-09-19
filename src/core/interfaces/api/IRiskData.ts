import { StatusEnum } from 'project/enum/status.enum';

import { QuantityTypeEnum } from 'core/constants/maps/quantity-risks';
import { IEpi } from 'core/interfaces/api/IEpi';

import {
  RiskRecTextTypeEnum,
  RiskRecTypeEnum,
} from './../../../project/enum/RiskRecType.enum';
import { IExam } from './IExam';
import { IGho } from './IGho';
import { IHierarchy } from './IHierarchy';
import { IProfessional } from './IProfessional';
import { IGenerateSource, IRecMed, IRiskFactors } from './IRiskFactors';
import { IUser } from './IUser';

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
  exams?: IExam[];
  isQuantity?: boolean;
  standardExams?: boolean;
  json?: IRiskDataJsonQui | IRiskDataJsonNoise;
  riskFactor?: IRiskFactors;
  origin?: string;
  ro?: string;
  level?: number;
  intervention?: string;
  dataRecs?: IRiskDataRec[];
  created_at: Date;
  updated_at: Date;
}

export interface IRiskDataRec {
  id: string;
  responsibleName: string;
  endDate: Date;
  comment: IRiskDataRecComment[];
  status: StatusEnum;
  recMedId: string;
  riskFactorDataId: string;
  created_at: Date;
  updated_at: Date;
  companyId: string;
}

export interface IRiskDataRecComment {
  id: string;
  text: string;
  type: RiskRecTypeEnum;
  textType: RiskRecTextTypeEnum;
  riskFactorDataRecId: string;
  updated_at: Date;
  created_at: Date;
}

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
  visitDate?: Date;
  complementarySystems: string[];
  complementaryDocs: string[];
  coordinatorBy: string;
  validityEnd?: Date | null;
  validityStart?: Date | null;
  professionals?: IProfessional[];
  users?: IUser[];
  isQ5?: boolean;
  hasEmergencyPlan?: boolean;
  data?: IRiskData[];
  months_period_level_5: number;
  months_period_level_4: number;
  months_period_level_3: number;
  months_period_level_2: number;
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
  attachments?: IPgrDocAttachment[];
}

export interface IPgrDocAttachment {
  id: string;
  name: string;
  url: string;
  created_at: Date;
  deleted_at: Date;
  updated_at: Date;
  riskFactorDocumentId: string;
}
