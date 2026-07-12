import { StatusEnum } from 'project/enum/status.enum';

export interface IEpi {
  id: number;
  ca: string;
  created_at: Date;
  expiredDate: Date;
  status: StatusEnum;
  observation: string;
  equipment: string;
  description: string;
  report: string;
  restriction: string;
  isValid: boolean;
  national: boolean;
  /** Situação textual oficial CAEPI (ex.: VÁLIDO / VENCIDO) */
  rawSituation?: string | null;
  processNumber?: string | null;
  manufacturerCnpj?: string | null;
  manufacturerName?: string | null;
  brand?: string | null;
  reference?: string | null;
  color?: string | null;
  laboratoryCnpj?: string | null;
  laboratoryName?: string | null;
  reportNumber?: string | null;
  standard?: string | null;
  epiRiskData: IEpiRiskData;
}

export interface IEpiRiskData {
  epiId: number;
  riskFactorDataId?: string;
  lifeTimeInDays?: number;
  efficientlyCheck?: boolean;
  epcCheck?: boolean;
  longPeriodsCheck?: boolean;
  validationCheck?: boolean;
  tradeSignCheck?: boolean;
  sanitationCheck?: boolean;
  maintenanceCheck?: boolean;
  unstoppedCheck?: boolean;
  trainingCheck?: boolean;
  epi?: IEpi;
}
