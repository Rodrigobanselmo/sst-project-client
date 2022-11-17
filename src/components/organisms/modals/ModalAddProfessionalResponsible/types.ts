import { BoxProps } from '@mui/material';
import { ProfessionalRespTypeEnum } from 'project/enum/professional-responsible-type.enum';

export interface SModalProfessionalResponsibleProps
  extends Omit<BoxProps, 'title'> {}

export interface SModalInitProfessionalResponsibleProps {
  id?: number;
  startDate: Date;
  companyId: string;
  professionalCouncilId: number;
  type?: ProfessionalRespTypeEnum;
}
