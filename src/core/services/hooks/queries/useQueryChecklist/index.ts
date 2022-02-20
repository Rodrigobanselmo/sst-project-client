import { useQuery } from 'react-query';

import { useAuth } from 'core/contexts/AuthContext';
import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { IChecklist } from 'core/interfaces/api/IChecklist';
import { IReactQuery } from 'core/interfaces/IReactQuery';
import { api } from 'core/services/apiClient';

import { QueryEnum } from '../../../../enums/query.enums';

export const queryChecklist = async (companyId = '') => {
  if (!companyId) return [];
  const response = await api.get<IChecklist[]>(
    `${ApiRoutesEnum.CHECKLIST_ALL}/${companyId}`,
  );

  return response.data;
};

export function useQueryChecklist(
  companyId?: string,
): IReactQuery<IChecklist[]> {
  const { user } = useAuth();
  const company = companyId || user?.companyId;

  const { data, ...query } = useQuery(
    [QueryEnum.CHECKLIST, company],
    () => queryChecklist(company),
    {
      staleTime: 1000 * 60 * 60, // 1 hour
    },
  );

  return { ...query, data: data || [] };
}
