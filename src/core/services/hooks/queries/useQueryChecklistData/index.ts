import { useEffect } from 'react';
import { useQuery, UseQueryResult } from 'react-query';

import { useRouter } from 'next/router';

import { IChecklist } from 'core/interfaces/api/IChecklist';
import { api } from 'core/services/apiClient';

import { QueryEnum } from '../../../../enums/query.enums';

export const queryChecklistData = async (checklistId: string) => {
  if (checklistId) {
    const response = await api.get<IChecklist>(
      `/checklist/data/${checklistId}`,
    );

    return response.data;
  }

  return {} as IChecklist;
};

export function useQueryChecklistData(): UseQueryResult<IChecklist> {
  const router = useRouter();
  const { checklistId } = router.query;

  const data = useQuery(
    [QueryEnum.CHECKLIST_DATA, checklistId],
    () => queryChecklistData(checklistId as string),
    {
      enabled: false,
    },
  );

  useEffect(() => {
    data.refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return data;
}
