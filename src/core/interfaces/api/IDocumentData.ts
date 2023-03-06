import { StatusEnum } from 'project/enum/status.enum';

import { IProfessional } from './IProfessional';

export interface IDocumentData {
  id: string;
  name: string;
  created_at: Date;
  companyId: string;
  status: StatusEnum;

  validityEnd?: Date | null;
  validityStart?: Date | null;

  elaboratedBy?: string;
  revisionBy?: string;
  approvedBy?: string;
  coordinatorBy: string;

  professionals?: IProfessional[];
}

export interface IPGRDocumentData extends IDocumentData {
  source?: string;
  visitDate?: Date;

  complementarySystems: string[];
  complementaryDocs: string[];

  isQ5?: boolean;
  hasEmergencyPlan?: boolean;

  months_period_level_5: number;
  months_period_level_4: number;
  months_period_level_3: number;
  months_period_level_2: number;
}
