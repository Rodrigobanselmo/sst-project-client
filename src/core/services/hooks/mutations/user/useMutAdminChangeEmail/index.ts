import { useMutation } from 'react-query';
import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

export type ChangeEmailResult = {
  id: number;
  name: string;
  email: string;
  notification: 'not_requested' | 'sent' | 'failed';
};
export type ChangeEmailInput = {
  companyId: string;
  id: number;
  email: string;
  expectedEmail: string;
  notifyUser: boolean;
};

export function useMutAdminChangeEmail() {
  return useMutation(
    async ({ companyId, id, ...input }: ChangeEmailInput) => {
      const { data } = await api.post<ChangeEmailResult>(
        `${ApiRoutesEnum.USERS}/company/${encodeURIComponent(companyId)}/${id}/admin-change-email`,
        input,
      );
      return data;
    },
    {
      onSuccess: () => {
        void queryClient
          .invalidateQueries([QueryEnum.USERS])
          .catch(() => undefined);
      },
    },
  );
}
