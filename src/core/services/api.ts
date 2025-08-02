/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosError } from 'axios';
import { destroyCookie, parseCookies, setCookie } from 'nookies';

import { signOut } from '../contexts/AuthContext';
import { AuthTokenError } from './errors/AuthTokenError';

let isRefreshing = false;
let failedRequestQueue: any[] = [];
let isAuthTokenError = false;

export function setupAPIClient(ctx = undefined) {
  let cookies = parseCookies(ctx);
  const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
      Authorization: `Bearer ${cookies['nextauth.token']}`,
    },
  });

  api.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error: AxiosError) => {
      if (error.response && error.response.status === 401) {
        if (error.response.data.type == 'application/json') {
          const fr = new FileReader();

          fr.onload = function () {
            if (JSON.parse(this.result as string)?.message === 'Unauthorized') {
              isAuthTokenError = true;
            } else {
              rejectAuth();
            }
          };

          fr.readAsText(error.response.data as unknown as Blob);

          if (!isAuthTokenError) return Promise.reject(error);
        }

        if (
          error.response.data?.message === 'Unauthorized' ||
          isAuthTokenError
        ) {
          cookies = parseCookies(ctx);
          isAuthTokenError = false;

          const { 'nextauth.refreshToken': refresh_token } = cookies;
          const originalConfig = error.config;

          if (!isRefreshing) {
            isRefreshing = true;

            api
              .post('/refresh', { refresh_token })
              .then((response) => {
                const { token } = response.data;

                setCookie(null, 'nextauth.token', token, {
                  maxAge: 60 * 60 * 25 * 30, // 30 days
                  path: '/',
                });

                setCookie(
                  null,
                  'nextauth.refreshToken',
                  response.data.refresh_token,
                  {
                    maxAge: 60 * 60 * 25 * 30, // 30 days
                    path: '/',
                  },
                );

                api.defaults.headers.common['Authorization'] =
                  `Bearer ${token}`;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (api.defaults.headers as any)['Authorization'] =
                  `Bearer ${token}`;

                failedRequestQueue.forEach((request) =>
                  request.onSuccess(token),
                );
                failedRequestQueue = [];
              })
              .catch((err) => {
                failedRequestQueue.forEach((request) => request.onFailure(err));
                failedRequestQueue = [];

                if (process.browser) {
                  destroyCookie(null, 'nextauth.token', { path: '/' });
                  destroyCookie(null, 'nextauth.refreshToken', {
                    path: '/',
                  });
                  signOut(ctx);
                }
              })
              .finally(() => {
                isRefreshing = false;
              });
          }

          return new Promise((resolve, reject) => {
            failedRequestQueue.push({
              onSuccess: (token: string) => {
                if (originalConfig?.headers)
                  originalConfig.headers['Authorization'] = `Bearer ${token}`;

                resolve(api(originalConfig));
              },
              onFailure: (err: AxiosError) => {
                reject(err);
              },
            });
          });
        } else {
          rejectAuth();
        }
      }

      return Promise.reject(error);
    },
  );

  return api;
}

const rejectAuth = () => {
  if (process.browser) {
    signOut();
  } else {
    return Promise.reject(new AuthTokenError());
  }
};
