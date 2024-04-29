import { StatusEnum } from 'project/enum/status.enum';

import { QuantityTypeEnum } from 'core/constants/maps/quantity-risks';
import { IEpi } from 'core/interfaces/api/IEpi';

import {
  RiskRecTextTypeEnum,
  RiskRecTypeEnum,
} from './../../../project/enum/RiskRecType.enum';
import { IDocumentData } from './IDocumentData';
import { IExam } from './IExam';
import { IGho } from './IGho';
import { IHierarchy } from './IHierarchy';
import { IGenerateSource, IRecMed, IRiskFactors } from './IRiskFactors';
import { ExposureTypeEnum } from 'core/enums/exposure.enum';

export type IRiskDataActivities = {
  activities: { description?: string; subActivity?: string }[];
  realActivity?: string;
};

export interface IRiskData {
  id: string;
  probability?: number;
  probabilityAfter?: number;
  companyId: string;
  riskId: string;
  homogeneousGroupId?: string;
  endDate?: Date;
  startDate?: Date;
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
  exposure?: ExposureTypeEnum;
  standardExams?: boolean;
  json?: IRiskDataJsonQui | IRiskDataJsonNoise;
  activities?: IRiskDataActivities;
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
  data?: IRiskData[];
}

export interface IRiskDocument {
  id: string;
  name: string;
  description: string;
  fileUrl: string;
  version: string;
  documentDataId: string;
  documentData: IDocumentData;
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
