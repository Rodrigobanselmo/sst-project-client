import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from 'core/services/apiClient';
import type { buildCampaignReportDataset } from './campaign-report.dataset';

export type Evidence = {
  id: string;
  label: string;
  details: {
    score?: number;
    denominator: number;
    count?: number;
    percentage?: number;
    respondents?: number;
  };
};
export type NarrativeSection =
  | 'executive'
  | 'findings'
  | 'listening'
  | 'integration'
  | 'recommendations'
  | 'limitations'
  | 'hypotheses';
export type NarrativeItem = { text: string; evidenceRefs: string[] };
export type ReportRun = {
  id: string;
  status: 'PROCESSING' | 'DONE' | 'FAILED';
  createdAt: string;
  updatedAt: string;
  requestedModel: string;
  returnedModels: string[];
  methodVersion: string;
  fingerprint: string;
  progress: { stage: string; completed: number; total: number } | null;
  errorCode: string | null;
  requiresReview: boolean;
  snapshot: null | {
    title: string;
    description?: string;
    formName: string;
    startedAt: string | null;
    endedAt: string | null;
    participantCount: number;
    methodVersion: string;
    groups: ReturnType<typeof buildCampaignReportDataset>;
  };
  result: null | {
    narrative: Record<NarrativeSection, NarrativeItem[]>;
    evidence: Evidence[];
    methodVersion: string;
    taxonomyVersion: string;
    taxonomy: { id: string; name: string; rule: string }[];
    listening: {
      questionId: string;
      title: string;
      received: number;
      empty: number | null;
      nonempty: number;
      included: number | null;
      excluded: number | null;
      protected: boolean;
      reasons: { reason: string; count: number }[] | null;
      themes: {
        id: string;
        name: string;
        count: number;
        percentage: number;
        points?: {
          id: string;
          text: string;
          kind: string;
          count: number;
          percentage: number;
        }[];
        hasUngroupedContent?: boolean;
      }[];
      suppressedThemes: boolean;
    }[];
  };
};
export type ReportContext = {
  fingerprint: string;
  methodVersion: string;
  taxonomyVersion: string;
  requestedModel: string;
  nonemptyTexts: number;
  taxonomy: { id: string; name: string; rule: string }[];
};
export function useCampaignReports(companyId: string, applicationId: string) {
  const path = `/v2/companies/${encodeURIComponent(companyId)}/forms/applications/${encodeURIComponent(applicationId)}/reports`;
  const runs = useQuery<ReportRun[]>({
    queryKey: ['campaign-reports', companyId, applicationId],
    queryFn: async () => (await api.get(path)).data,
    retry: false,
    refetchInterval: (query) =>
      query.state.data?.some((run) => run.status === 'PROCESSING')
        ? 3000
        : false,
  });
  const generate = useMutation({
    mutationFn: async () => {
      const context = (await api.get<ReportContext>(`${path}/context`)).data;
      return (
        await api.post<ReportRun>(`${path}/generation`, {
          fingerprint: context.fingerprint,
        })
      ).data;
    },
    onSuccess: () => runs.refetch(),
  });
  return { runs, generate };
}
