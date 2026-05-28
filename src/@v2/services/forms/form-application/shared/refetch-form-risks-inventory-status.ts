import { QueryClient } from '@tanstack/react-query';

import { getKeyBrowseFormQuestionsAnswersRisks } from '@v2/services/forms/form-questions-answers/browse-form-questions-answers-risks/hooks/useFetchBrowseFormQuestionsAnswersRisks';

export async function refetchFormRisksInventoryStatus(
  queryClient: QueryClient,
  params: { companyId: string; applicationId: string },
) {
  await queryClient.refetchQueries({
    queryKey: getKeyBrowseFormQuestionsAnswersRisks({
      companyId: params.companyId,
      applicationId: params.applicationId,
    }),
  });
}
