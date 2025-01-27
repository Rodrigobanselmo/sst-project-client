import { AuthRoutes } from '@v2/constants/routes/auth.routes';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';

export interface SignInParams {
  token: string;
  email?: string | null;
  password?: string | null;
  googleToken?: string | null;
}

export async function signInService(body: SignInParams) {
  await api.post(AuthRoutes.SESSION.SIGN_IN, body);
}
