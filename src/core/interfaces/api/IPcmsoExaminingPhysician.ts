import { StatusEnum } from 'project/enum/status.enum';

import { IProfessional } from './IProfessional';

export type PcmsoExaminingPhysicianResolvedSource = 'COMPANY' | 'WORKSPACE';

export interface IPcmsoExaminingPhysicianCouncil {
  id: number;
  councilType: string;
  councilUF: string;
  councilId: string;
  professionalId: number;
  professional?: IProfessional;
}

export interface IPcmsoExaminingPhysician {
  id: string;
  companyId: string;
  workspaceId: string | null;
  professionalCouncilId: number;
  notes?: string | null;
  sortOrder: number;
  status: StatusEnum;
  created_at: string;
  updated_at: string;
  professionalCouncil?: IPcmsoExaminingPhysicianCouncil;
}

export interface IPcmsoExaminingPhysicianResolved {
  source: PcmsoExaminingPhysicianResolvedSource;
  items: IPcmsoExaminingPhysician[];
}

export function formatExaminingPhysicianName(
  row: IPcmsoExaminingPhysician,
): string {
  return row.professionalCouncil?.professional?.name || '-';
}

export function formatExaminingPhysicianCouncil(
  row: IPcmsoExaminingPhysician,
): string {
  const council = row.professionalCouncil;
  if (!council) return '-';

  const credential = `${council.councilUF ? `${council.councilUF}-` : ''}${council.councilId || ''}`;
  return [council.councilType, credential].filter(Boolean).join(' ');
}

export function mapExaminingPhysicianToProfessional(
  row: IPcmsoExaminingPhysician,
): IProfessional | undefined {
  const council = row.professionalCouncil;
  if (!council?.professional) return undefined;

  return {
    ...council.professional,
    id: council.id,
    councilType: council.councilType,
    councilUF: council.councilUF,
    councilId: council.councilId,
  };
}
