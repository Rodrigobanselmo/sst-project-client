import { DocumentTypeEnum } from 'project/enum/document.enums';
import { StatusEnum } from 'project/enum/status.enum';

import { ICompany } from './ICompany';
import { IDocumentModel } from './IDocumentModel';
import { IProfessional, IProfessionalToDocumentData } from './IProfessional';

interface IDocumentDataBase {
  id: string;
  name: string;
  created_at: Date;
  companyId: string;
  workspaceId: string;
  validityStart: Date;
  validityEnd: Date;
  status: StatusEnum;
  modelId: number;
  elaboratedBy: string;
  coordinatorBy: string;
  revisionBy: string;
  approvedBy: string;

  company?: Partial<ICompany>;
  professionals?: IProfessional[];
  professionalsSignatures?: IProfessionalToDocumentData[];
  model: IDocumentModel;
}

export interface IPGRDocumentData extends IDocumentDataBase {
  type: DocumentTypeEnum.PGR;
  json: {
    source: string;
    validity: string;
    complementaryDocs: string[];
    complementarySystems: string[];
    visitDate?: Date;
    months_period_level_2: number;
    months_period_level_3: number;
    months_period_level_4: number;
    months_period_level_5: number;
    isQ5: boolean;
    hasEmergencyPlan: boolean;
  };
}

export interface IPCMSODocumentData extends IDocumentDataBase {
  type: DocumentTypeEnum.PCSMO;
  json: {
    source: string;
    validity: string;
    visitDate?: Date;
    complementaryDocs: string[];
  };
}

export interface IOtherDocumentData extends IDocumentDataBase {
  type: DocumentTypeEnum.OTHER;
  json: any;
}

export type IDocumentData =
  | IPCMSODocumentData
  | IPGRDocumentData
  | IOtherDocumentData;
