import axios from 'axios';
import decode from 'jwt-decode';
import { parseCookies, setCookie } from 'nookies';

import { browserAuthSession } from './auth-session-lifecycle';
import { createAuthRefreshCoordinator } from './auth-refresh-coordinator';

const cookieOptions = { maxAge: 60 * 60 * 25 * 30, path: '/' };
const renewalClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 15000,
});

const refresh = createAuthRefreshCoordinator({
  read() {
    const cookies = parseCookies();
    return {
      token: cookies['nextauth.token'],
      refreshToken: cookies['nextauth.refreshToken'],
    };
  },
  write({ token, refreshToken }) {
    setCookie(null, 'nextauth.token', token, cookieOptions);
    setCookie(null, 'nextauth.refreshToken', refreshToken, cookieOptions);
  },
  scope(token) {
    try {
      return decode<{
        sub?: string | number;
        companyId?: string;
        exp?: number;
      }>(token);
    } catch {
      return undefined;
    }
  },
  async renew(refreshToken, companyId) {
    const { data } = await renewalClient.post('/refresh', {
      refresh_token: refreshToken,
      companyId,
    });
    if (
      typeof data?.token !== 'string' ||
      !data.token ||
      typeof data?.refresh_token !== 'string' ||
      !data.refresh_token
    )
      throw new Error('A API não retornou uma sessão válida.');
    return { token: data.token, refreshToken: data.refresh_token };
  },
  async lock(task) {
    return navigator.locks
      ? await navigator.locks.request('simplesst:session-refresh', task)
      : task();
  },
  isRejected(error) {
    return axios.isAxiosError(error) && error.response?.status === 401;
  },
});

export function refreshBrowserSession(
  options: {
    accessToken?: string;
    companyId?: string;
    generation?: number;
  } = {},
) {
  const generation = options.generation ?? browserAuthSession.capture();
  return refresh({
    ...options,
    isCurrent: () => browserAuthSession.isCurrent(generation),
  });
}
