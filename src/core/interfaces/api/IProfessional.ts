import { ProfessionalTypeEnum } from 'project/enum/professional-type.enum';
import { StatusEnum } from 'project/enum/status.enum';

export type IProfessional = {
  id: number;
  name: string;
  email: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
  companyId: string;
  formation: string[];
  certifications: string[];
  cpf: string;
  phone: string;
  userId: number;
  type: ProfessionalTypeEnum;
  status: StatusEnum;
  professionalDocumentDataSignature?: IProfessionalToDocumentData;
  professionalsDocumentDataSignatures?: IProfessionalToDocumentData[];
  councils: IProfessionalCouncil[];

  professionalId?: number;
  councilType?: string;
  councilUF?: string;
  councilId?: string;

  crm: string;
  crea: string;
};

export interface IProfessionalToDocumentData {
  documentDataId: string;
  professionalId: number;
  isSigner: boolean;
  isElaborator: boolean;
  professional?: IProfessional;
}

export type IProfessionalCouncil = {
  id: number;
  councilType: string;
  councilUF: string;
  councilId: string;
  created_at: Date;
  updated_at: Date;
  professionalId: number;
  professional: IProfessional;
};
