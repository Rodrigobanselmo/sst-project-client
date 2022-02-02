/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosError } from 'axios';
import { parseCookies, setCookie } from 'nookies';

import { signOut } from '../contexts/AuthContext';
import { AuthTokenError } from './errors/AuthTokenError';

let isRefreshing = false;
let failedRequestQueue: any[] = [];

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
    (error: AxiosError) => {
      if (error.response && error.response.status === 401) {
        if (error.response.data?.message === 'Unauthorized') {
          cookies = parseCookies(ctx);

          const { 'nextauth.refreshToken': refresh_token } = cookies;
          const originalConfig = error.config;

          if (!isRefreshing) {
            isRefreshing = true;

            api
              .post('/refresh', { refresh_token })
              .then((response) => {
                const { token } = response.data;

                setCookie(ctx, 'nextauth.token', token, {
                  maxAge: 60 * 60 * 25 * 30, // 30 days
                  path: '/',
                });

                setCookie(
                  ctx,
                  'nextauth.refreshToken',
                  response.data.refresh_token,
                  {
                    maxAge: 60 * 60 * 25 * 30, // 30 days
                    path: '/',
                  },
                );

                api.defaults.headers.common[
                  'Authorization'
                ] = `Bearer ${token}`;

                failedRequestQueue.forEach((request) =>
                  request.onSuccess(token),
                );
                failedRequestQueue = [];
              })
              .catch((err) => {
                console.log(err);
                console.log(err.response);
                console.log(err.response.data);
                failedRequestQueue.forEach((request) => request.onFailure(err));
                failedRequestQueue = [];

                if (process.browser) {
                  signOut();
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
                console.log(err);
                console.log(err.response);
                console.log(err?.response?.data);
                reject(err);
              },
            });
          });
        } else {
          if (process.browser) {
            signOut();
          } else {
            return Promise.reject(new AuthTokenError());
          }
        }
      }

      return Promise.reject(error);
    },
  );

  return api;
}
