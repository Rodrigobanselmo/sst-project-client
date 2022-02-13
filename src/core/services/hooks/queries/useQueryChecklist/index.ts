import { useQuery } from 'react-query';

import { useAuth } from 'core/contexts/AuthContext';
import { IChecklist } from 'core/interfaces/IChecklist';
import { IReactQuery } from 'core/interfaces/IReactQuery';
import { IUser } from 'core/interfaces/IUser';
import { api } from 'core/services/apiClient';

import { QueryEnum } from '../../../../enums/query.enums';

export const queryChecklist = async (user: IUser | null) => {
  if (user) {
    const companyId = user?.actualCompany;

    const response = await api.get<IChecklist[]>(`/checklist/${companyId}`);

    return response.data;
  }
  return [];
};

export function useQueryChecklist(): IReactQuery<IChecklist[]> {
  const { user } = useAuth();

  const { data, ...query } = useQuery(
    QueryEnum.CHECKLIST,
    () => queryChecklist(user),
    {
      staleTime: 1000 * 60 * 60, // 1 hour
      placeholderData: [],
    },
  );

  return { ...query, data: data || [] };
}
