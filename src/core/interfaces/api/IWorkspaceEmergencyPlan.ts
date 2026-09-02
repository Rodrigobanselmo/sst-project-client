export type WorkspaceEmergencyPointType = 'ENCONTRO' | 'APANHA';
export type WorkspaceEmergencySignalType =
  | 'INTERMITENTE'
  | 'CONTINUO_LONGO'
  | 'CUSTOM';

export interface IWorkspaceEmergencyAlarm {
  id: string;
  companyId: string;
  workspaceId: string;
  planId: string;
  name: string;
  signalPattern: string | null;
  signalCount: number | null;
  signalType: WorkspaceEmergencySignalType | null;
  duration: string | null;
  durationSeconds: number | null;
  meaning: string | null;
  guidance: string | null;
  sortOrder: number;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
}

export interface IWorkspaceEmergencyPoint {
  id: string;
  companyId: string;
  workspaceId: string;
  planId: string;
  type: WorkspaceEmergencyPointType;
  code: string | null;
  name: string;
  description: string | null;
  guidance: string | null;
  sortOrder: number;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
}

export interface IWorkspaceEmergencyContact {
  id: string;
  companyId: string;
  workspaceId: string;
  planId: string;
  name: string;
  area: string | null;
  phone: string | null;
  mobile: string | null;
  radioChannel: string | null;
  zone: string | null;
  observation: string | null;
  sortOrder: number;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
}

export interface IWorkspaceEmergencyMap {
  id: string;
  companyId: string;
  workspaceId: string;
  planId: string;
  title: string;
  caption: string | null;
  photoUrl: string;
  sortOrder: number;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
}

export interface IWorkspaceEmergencyPlan {
  id: string | null;
  companyId: string;
  workspaceId: string;
  enabled: boolean;
  generalGuidance: string | null;
  incidentGuidance: string | null;
  created_at: string | null;
  updated_at: string | null;
  alarms: IWorkspaceEmergencyAlarm[];
  points: IWorkspaceEmergencyPoint[];
  contacts: IWorkspaceEmergencyContact[];
  maps: IWorkspaceEmergencyMap[];
}

export interface IUpsertWorkspaceEmergencyAlarm {
  id?: string;
  name: string;
  signalPattern?: string | null;
  signalCount?: number | null;
  signalType?: WorkspaceEmergencySignalType | null;
  duration?: string | null;
  durationSeconds?: number | null;
  meaning?: string | null;
  guidance?: string | null;
  sortOrder?: number;
}

export interface IUpsertWorkspaceEmergencyPoint {
  id?: string;
  type: WorkspaceEmergencyPointType;
  code?: string | null;
  name: string;
  description?: string | null;
  guidance?: string | null;
  sortOrder?: number;
}

export interface IUpsertWorkspaceEmergencyContact {
  id?: string;
  name: string;
  area?: string | null;
  phone?: string | null;
  mobile?: string | null;
  radioChannel?: string | null;
  zone?: string | null;
  observation?: string | null;
  sortOrder?: number;
}

export interface IUpsertWorkspaceEmergencyMap {
  id?: string;
  title: string;
  caption?: string | null;
  photoUrl?: string | null;
  sortOrder?: number;
}

export interface IUpsertWorkspaceEmergencyPlan {
  enabled?: boolean;
  generalGuidance?: string | null;
  incidentGuidance?: string | null;
  alarms?: IUpsertWorkspaceEmergencyAlarm[];
  points?: IUpsertWorkspaceEmergencyPoint[];
  contacts?: IUpsertWorkspaceEmergencyContact[];
  maps?: IUpsertWorkspaceEmergencyMap[];
}

export const WORKSPACE_EMERGENCY_POINT_TYPE_LABELS: Record<
  WorkspaceEmergencyPointType,
  string
> = {
  ENCONTRO: 'Ponto de encontro',
  APANHA: 'Ponto de apanha',
};

export const WORKSPACE_EMERGENCY_POINT_TYPE_OPTIONS = [
  { content: 'Ponto de encontro', value: 'ENCONTRO' },
  { content: 'Ponto de apanha', value: 'APANHA' },
];

export const WORKSPACE_EMERGENCY_SIGNAL_TYPE_LABELS: Record<
  WorkspaceEmergencySignalType,
  string
> = {
  INTERMITENTE: 'Intermitente',
  CONTINUO_LONGO: 'Contínuo longo',
  CUSTOM: 'Outro',
};

export const WORKSPACE_EMERGENCY_SIGNAL_TYPE_OPTIONS = [
  { content: 'Intermitente', value: 'INTERMITENTE' },
  { content: 'Contínuo longo', value: 'CONTINUO_LONGO' },
  { content: 'Outro', value: 'CUSTOM' },
];
