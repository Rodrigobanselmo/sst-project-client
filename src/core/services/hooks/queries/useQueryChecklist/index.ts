import { useQuery } from 'react-query';

import { useAuth } from 'core/contexts/AuthContext';
import { IChecklist } from 'core/interfaces/IChecklist';
import { IReactQuery } from 'core/interfaces/IReactQuery';
import { api } from 'core/services/apiClient';

import { QueryEnum } from '../../../../enums/query.enums';

export const queryChecklist = async (companyId?: string) => {
  if (!companyId) return [];
  const response = await api.get<IChecklist[]>(`/checklist/${companyId}`);

  return response.data;
};

export function useQueryChecklist(
  companyId?: string,
): IReactQuery<IChecklist[]> {
  const { user } = useAuth();

  const { data, ...query } = useQuery(
    QueryEnum.CHECKLIST,
    () => queryChecklist(companyId || user?.companyId),
    {
      staleTime: 1000 * 60 * 60, // 1 hour
    },
  );

  return { ...query, data: data || [] };
}
