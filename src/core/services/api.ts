import { askSstDecision } from '@v2/features/sst-operational/mutation-decision';
import { askCatalogDecision } from '@v2/features/sst-operational/catalog-decision';
import { askStructuralDecision } from '@v2/features/sst-operational/structural-decision';
import type { CatalogPreview } from '@v2/features/sst-operational/catalog-review-model';
import { sstDecisionCompanyId } from '@v2/features/sst-operational/edit-context';
/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosError } from 'axios';
import { destroyCookie, parseCookies, setCookie } from 'nookies';

import { signOut } from '../contexts/AuthContext';
import { browserAuthSession } from '../contexts/auth-session-lifecycle';
import { canRequestAfterSessionEnd } from '../contexts/auth-session-policy';
import { AuthTokenError } from './errors/AuthTokenError';

export function setupAPIClient(ctx = undefined) {
  // A client factory owns its refresh queue. SSR clients for different requests
  // must never settle one another's requests or attach another user's token.
  let isRefreshing = false;
  let failedRequestQueue: any[] = [];
  let isAuthTokenError = false;
  let cookies = parseCookies(ctx);
  const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
      Authorization: `Bearer ${cookies['nextauth.token']}`,
    },
  });

  api.interceptors.request.use((config) => {
    config.headers ??= {};
    if (
      !canRequestAfterSessionEnd({
        isBrowser: typeof window !== 'undefined',
        ended: typeof window !== 'undefined' && browserAuthSession.isEnded(),
        method: config.method,
        url: config.url,
        baseURL: config.baseURL,
      })
    )
      throw new axios.Cancel('A sessão foi encerrada.');
    if (typeof window !== 'undefined') {
      const previousGeneration = (config as any).sstAuthGeneration;
      if (
        typeof previousGeneration === 'number' &&
        !browserAuthSession.isCurrent(previousGeneration)
      )
        throw new axios.Cancel('A sessão foi encerrada.');
      const authenticated = /^Bearer (?!undefined$|null$).+/.test(
        String(
          config.headers.Authorization || config.headers.authorization || '',
        ),
      );
      if (authenticated || /(?:^|\/)refresh(?:\?|$)/.test(config.url || '')) {
        if (browserAuthSession.isEnded())
          throw new axios.Cancel('A sessão foi encerrada.');
        (config as any).sstAuthGeneration = browserAuthSession.capture();
      }
    }
    if (
      typeof window !== 'undefined' &&
      ['post', 'put', 'patch', 'delete'].includes(config.method || '') &&
      !config.headers['x-sst-operation-id']
    )
      config.headers['x-sst-operation-id'] = crypto.randomUUID();
    return config;
  });
  api.interceptors.response.use(
    (response) => {
      const generation = (response.config as any)?.sstAuthGeneration;
      if (
        typeof window !== 'undefined' &&
        typeof generation === 'number' &&
        !browserAuthSession.isCurrent(generation)
      )
        return Promise.reject(new axios.Cancel('A sessão foi encerrada.'));
      return response;
    },
    async (error: AxiosError) => {
      const data = error.response?.data as any;
      const original = error.config as any;
      if (
        typeof window !== 'undefined' &&
        typeof original?.sstAuthGeneration === 'number' &&
        !browserAuthSession.isCurrent(original.sstAuthGeneration)
      )
        return Promise.reject(new axios.Cancel('A sessão foi encerrada.'));
      if (
        data?.code ===
          'SST_DECLARED_CHARACTERIZATION_STRUCTURE_REQUIRES_REVIEW' &&
        data?.target &&
        data?.companyId &&
        original &&
        !original.sstStructuralReviewTried
      ) {
        original.sstStructuralReviewTried = true;
        const result = await askStructuralDecision({
          companyId: data.companyId,
          target: data.target,
          action: data.action || 'ARCHIVE',
        });
        return {
          ...error.response,
          status: 200,
          statusText: 'OK',
          config: original,
          data: { id: data.target.id, companyId: data.companyId, ...result },
        };
      }
      if (
        data?.code === 'SST_CATALOG_REVIEW_REQUIRED' &&
        original &&
        !original.sstCatalogReviewTried
      ) {
        original.sstCatalogReviewTried = true;
        const root = `/companies/${encodeURIComponent(data.companyId)}/sst-operational/catalog`;
        const { data: preview } = await api.post<CatalogPreview>(
          root + '/preview',
          { target: data.target, patch: data.patch },
        );
        const operationId = crypto.randomUUID();
        return askCatalogDecision(
          preview,
          (decision) =>
            api.post(root + '/apply', {
              operationId,
              target: data.target,
              patch: data.patch,
              expectedHead: preview.expectedHead,
              impactHash: preview.impactHash,
              ...decision,
            }),
          sstDecisionCompanyId(data.companyId, original),
        );
      }
      if (
        data?.code === 'SST_DECISION_REQUIRED' &&
        original &&
        !original.sstDecisionTried
      ) {
        const decision = await askSstDecision({
          companyId: sstDecisionCompanyId(data.companyId, original),
          expectedHead: data.expectedHead,
          message: data.message,
          affectedEmployments: data.affectedEmployments,
        });
        original.sstDecisionTried = true;
        original.headers['x-sst-decision'] = encodeURIComponent(
          JSON.stringify(decision),
        );
        return api(original);
      }
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
          const generation = original?.sstAuthGeneration;
          if (
            typeof window !== 'undefined' &&
            (!refresh_token ||
              typeof generation !== 'number' ||
              !browserAuthSession.isCurrent(generation))
          )
            return Promise.reject(error);

          if (!isRefreshing) {
            isRefreshing = true;

            api
              .post('/refresh', { refresh_token })
              .then((response) => {
                if (
                  typeof window !== 'undefined' &&
                  (!browserAuthSession.isCurrent(generation) ||
                    parseCookies(ctx)['nextauth.refreshToken'] !==
                      refresh_token)
                )
                  throw new axios.Cancel('A sessão foi encerrada.');
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

                if (
                  process.browser &&
                  !axios.isCancel(err) &&
                  browserAuthSession.isCurrent(generation)
                ) {
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
                if (
                  typeof window !== 'undefined' &&
                  !browserAuthSession.isCurrent(generation)
                ) {
                  reject(new axios.Cancel('A sessão foi encerrada.'));
                  return;
                }
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
