import { useEffect } from 'react';
import { useQuery, UseQueryResult } from 'react-query';

import { useRouter } from 'next/router';

import { useAuth } from 'core/contexts/AuthContext';
import { IChecklist } from 'core/interfaces/IChecklist';
import { IUser } from 'core/interfaces/IUser';
import { api } from 'core/services/apiClient';

import { QueryEnum } from '../../../../enums/query.enums';

export const queryChecklistData = async (
  checklistId: string,
  user: IUser | null,
) => {
  if (checklistId && user) {
    const companyId = user?.actualCompany;

    const response = await api.get<IChecklist>(
      `/checklist/data/${checklistId}/${companyId}`,
    );

    return response.data;
  }

  return {} as IChecklist;
};

export function useQueryChecklistData(): UseQueryResult<IChecklist> {
  const router = useRouter();
  const { checklistId } = router.query;

  const { user } = useAuth();

  const data = useQuery(
    [QueryEnum.CHECKLIST_DATA, checklistId],
    () => queryChecklistData(checklistId as string, user),
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
