import { StatusEnum } from 'project/enum/status.enum';

import { IProfessional } from './IProfessional';

export interface IDocumentPCMSO {
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
  coordinatorBy: string;
  validityEnd?: Date | null;
  validityStart?: Date | null;
  professionals?: IProfessional[];
  // users?: IUser[];
}
