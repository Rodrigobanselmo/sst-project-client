import { AuthRoutes } from '@v2/constants/routes/auth.routes';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';

export interface AddUserParams {
  name: string;
  companyId: string;
  groupId: number;
  email?: string | null;
  employeeId?: number | null;
  phone?: string | null;
  cpf?: string | null;
}

export async function addUserService({ companyId, ...body }: AddUserParams) {
  const response = await api.post<{ id: number }>(
    bindUrlParams({
      path: AuthRoutes.USER.ADD,
      pathParams: { companyId },
    }),
    body,
  );

  return response.data;
}
