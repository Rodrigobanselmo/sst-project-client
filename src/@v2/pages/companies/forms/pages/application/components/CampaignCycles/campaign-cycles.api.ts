import { useQuery } from '@tanstack/react-query';
import { api } from 'core/services/apiClient';
export type CampaignCycles = {
  seriesName: string;
  current: {
    applicationId: string;
    number: number;
    referencePeriod: string;
    status: string;
    automaticStart: boolean;
    automaticEnd: boolean;
    canEditSchedule: boolean;
    plannedStart?: string;
    plannedEnd?: string;
  };
  cycles: {
    applicationId: string;
    number: number;
    referencePeriod: string;
    name: string;
    status: string;
  }[];
  canCreate: boolean;
  fingerprint: string;
  questionCount: number;
  workspaces: { id: string; name: string }[];
  selectedWorkspaceIds: string[];
  hasHierarchyFilter: boolean;
};
const path = (companyId: string, id: string) =>
  `/v2/companies/${encodeURIComponent(companyId)}/forms/applications/${encodeURIComponent(id)}/cycles`;
export function useCampaignCycles(companyId: string, id?: string) {
  return useQuery<CampaignCycles>({
    queryKey: ['form-campaign-cycles', companyId, id],
    enabled: !!companyId && !!id,
    retry: false,
    queryFn: async () => (await api.get(path(companyId, id!))).data,
  });
}
export async function createCampaignCycle(
  companyId: string,
  id: string,
  input: {
    name: string;
    referencePeriod: string;
    sourceReferencePeriod: string;
    seriesName: string;
    fingerprint: string;
    workspaceIds: string[];
    automaticStart?: boolean;
    automaticEnd?: boolean;
    preserveHierarchyFilter?: boolean;
    plannedStart?: string;
    plannedEnd?: string;
  },
) {
  return (await api.post<{ id: string }>(path(companyId, id), input)).data;
}

export async function updateCampaignSchedule(
  companyId: string,
  id: string,
  input: {
    plannedStart?: string;
    plannedEnd?: string;
    automaticStart: boolean;
    automaticEnd: boolean;
  },
) {
  return (await api.patch(`${path(companyId, id)}/schedule`, input)).data;
}
