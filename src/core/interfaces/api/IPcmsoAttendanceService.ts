import { StatusEnum } from 'project/enum/status.enum';

export type PcmsoAttendanceServiceTypeEnum =
  | 'HOSPITAL'
  | 'UPA'
  | 'CLINIC'
  | 'EMERGENCY_ROOM'
  | 'EMERGENCY'
  | 'OTHER';

export interface IPcmsoAttendanceService {
  id: string;
  companyId: string;
  workspaceId: string;
  name: string;
  serviceType: PcmsoAttendanceServiceTypeEnum;
  address?: string | null;
  phone?: string | null;
  distanceLabel?: string | null;
  travelTimeLabel?: string | null;
  notes?: string | null;
  sortOrder: number;
  status: StatusEnum;
  created_at: string;
  updated_at: string;
}

export const PCMsoAttendanceServiceTypeLabels: Record<PcmsoAttendanceServiceTypeEnum, string> = {
  HOSPITAL: 'Hospital',
  UPA: 'UPA',
  CLINIC: 'Clínica',
  EMERGENCY_ROOM: 'Pronto-atendimento',
  EMERGENCY: 'Emergência',
  OTHER: 'Outro',
};

export const PCMsoAttendanceServiceTypeOptions = Object.entries(
  PCMsoAttendanceServiceTypeLabels,
).map(([value, content]) => ({ value, content }));
