import { destroyCookie, parseCookies, setCookie } from 'nookies';

import { signOut } from '../contexts/AuthContext';
import { AuthTokenError } from './errors/AuthTokenError';
import { fetchApi } from './fetchClient';

let isRefreshing = false;
let failedRequestQueue: any[] = [];
const headers: any = {};
let cookies: any = {};

export function setupAPIClient(ctx = undefined) {
  cookies = parseCookies(ctx);
  headers['Authorization'] = `Bearer ${cookies['nextauth.token']}`;

  return {
    async get(url: string) {
      const response = await fetch(process.env.NEXT_PUBLIC_API_URL + url, {
        headers: headers,
        method: 'GET',
      });

      return handleResponse(response, { url, method: 'get' });
    },

    async post(url: string, data: any) {
      const response = await fetch(process.env.NEXT_PUBLIC_API_URL + url, {
        headers,
        method: 'POST',
        body: JSON.stringify(data),
      });

      return handleResponse(response, {
        url,
        method: 'post',
        body: JSON.stringify(data),
      });
    },

    async patch(url: string, data: any) {
      const response = await fetch(process.env.NEXT_PUBLIC_API_URL + url, {
        headers,
        method: 'PUT',
        body: JSON.stringify(data),
      });

      return handleResponse(response, {
        url,
        method: 'patch',
        body: JSON.stringify(data),
      });
    },

    async delete(url: string) {
      const response = await fetch(process.env.NEXT_PUBLIC_API_URL + url, {
        headers,
        method: 'DELETE',
      });

      return handleResponse(response, { url, method: 'patch' });
    },
  };

  function handleResponse(
    response: Response,
    originalConfig: {
      url: string;
      body?: any;
      method: 'get' | 'post' | 'patch' | 'delete';
    },
  ) {
    return new Promise((resolve, reject) => {
      resolve(response.json());
      if (response.ok) {
      } else {
        response.text().then((text) => {
          try {
            const data = JSON.parse(text);

            if (data?.message === 'Unauthorized') {
              cookies = parseCookies(ctx);
              const { 'nextauth.refreshToken': refresh_token } = cookies;

              if (!isRefreshing) {
                isRefreshing = true;

                fetchApi
                  .post('/refresh', { refresh_token })
                  .then((response) => {
                    const { token } = (response as any).data;

                    setCookie(null, 'nextauth.token', token, {
                      maxAge: 60 * 60 * 25 * 30, // 30 days
                      path: '/',
                    });

                    setCookie(
                      null,
                      'nextauth.refreshToken',
                      (response as any).data.refresh_token,
                      {
                        maxAge: 60 * 60 * 25 * 30, // 30 days
                        path: '/',
                      },
                    );

                    headers.common['Authorization'] = `Bearer ${token}`;
                    headers['Authorization'] = `Bearer ${token}`;

                    failedRequestQueue.forEach((request) =>
                      request.onSuccess(),
                    );
                    failedRequestQueue = [];
                  })
                  .catch((err) => {
                    failedRequestQueue.forEach((request) =>
                      request.onFailure(err),
                    );
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
                  onSuccess: () => {
                    resolve(
                      fetchApi[originalConfig.method](
                        originalConfig.url,
                        originalConfig.body,
                      ),
                    );
                  },
                  onFailure: (err: any) => {
                    reject(err);
                  },
                });
              });
            } else {
              rejectAuth();
            }
          } catch (err) {
            console.error(err);
            reject(err);
          }
        });
      }
    });
  }

  function rejectAuth() {
    if (process.browser) {
      // signOut();
    } else {
      return Promise.reject(new AuthTokenError());
    }
  }
}
