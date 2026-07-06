import { v2QueryClient } from '@v2/services/query-client';

import { examRiskLinkStatusQueryKeys } from './exam-risk-link-status.query-keys';

export async function refetchExamRiskLinkStatusQueries() {
  const queryKey = examRiskLinkStatusQueryKeys.all();

  await v2QueryClient.invalidateQueries({ queryKey });
  await v2QueryClient.refetchQueries({ queryKey, type: 'active' });
}
