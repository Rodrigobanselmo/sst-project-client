import { useFetch } from '@v2/hooks/api/useFetch';

import { browseExamRiskLinkStatus } from '../company-exam-risk-link-status.service';
import type { IBrowseExamRiskLinkStatusParams } from '../company-exam-risk-link-status.types';
import { examRiskLinkStatusQueryKeys } from './exam-risk-link-status.query-keys';

export const useFetchExamRiskLinkStatus = (
  params: IBrowseExamRiskLinkStatusParams,
  enabled = true,
) =>
  useFetch({
    queryKey: examRiskLinkStatusQueryKeys.browse(params),
    queryFn: () => browseExamRiskLinkStatus(params),
    enabled: enabled && Boolean(params.companyId),
    refetchOnMount: true,
  });
