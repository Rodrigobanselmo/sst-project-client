import { askSstDecision } from '@v2/features/sst-operational/mutation-decision';
import { publishAiAccountingFailure } from '@v2/features/ai-accounting/ai-accounting-notice';
import { askCatalogDecision } from '@v2/features/sst-operational/catalog-decision';
import { askStructuralDecision } from '@v2/features/sst-operational/structural-decision';
import type { CatalogPreview } from '@v2/features/sst-operational/catalog-review-model';
import { sstDecisionCompanyId } from '@v2/features/sst-operational/edit-context';
/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosError } from 'axios';
import { parseCookies, setCookie } from 'nookies';

import { signOut } from '../contexts/AuthContext';
import { browserAuthSession } from '../contexts/auth-session-lifecycle';
import {
  canRequestAfterSessionEnd,
  isPublicAuthRequest,
} from '../contexts/auth-session-policy';
import { refreshBrowserSession } from '../contexts/browser-session-refresh';
import {
  SessionRefreshRejected,
  SessionRefreshSuperseded,
} from '../contexts/auth-refresh-coordinator';
import { AuthTokenError } from './errors/AuthTokenError';

export function setupAPIClient(ctx = undefined) {
  // SSR requests keep their own cookies and never use the browser coordinator.
  let cookies = parseCookies(ctx);
  let serverRefresh: Promise<string> | undefined;
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
      if (error.response?.status === 429)
        await publishAiAccountingFailure(data);
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
      if (
        error.response?.status !== 401 ||
        !original ||
        original.sstAuthRetried ||
        isPublicAuthRequest(original.method, original.url, original.baseURL)
      )
        throw error;

      const accessToken = String(
        original.headers?.Authorization ||
          original.headers?.authorization ||
          '',
      ).replace(/^Bearer /, '');
      if (
        !accessToken ||
        accessToken === 'undefined' ||
        accessToken === 'null' ||
        /(?:^|\/)refresh(?:\?|$)/.test(original.url || '')
      )
        throw error;

      let message = data?.message;
      if (typeof Blob !== 'undefined' && data instanceof Blob) {
        try {
          message = JSON.parse(await data.text())?.message;
        } catch {
          throw error;
        }
      }
      if (message !== 'Unauthorized') throw error;

      let token: string;
      if (typeof window !== 'undefined') {
        try {
          token = await refreshBrowserSession({
            accessToken,
            generation: original.sstAuthGeneration,
          });
        } catch (refreshError) {
          if (refreshError instanceof SessionRefreshSuperseded)
            throw new axios.Cancel('A sessão mudou durante a renovação.');
          if (refreshError instanceof SessionRefreshRejected)
            await signOut(ctx);
          throw refreshError;
        }
      } else {
        if (!cookies['nextauth.token']) throw error;
        if (cookies['nextauth.token'] !== accessToken) {
          token = cookies['nextauth.token'];
        } else {
          if (!cookies['nextauth.refreshToken']) throw new AuthTokenError();
          serverRefresh ??= axios
            .post(
              '/refresh',
              { refresh_token: cookies['nextauth.refreshToken'] },
              { baseURL: api.defaults.baseURL, timeout: 15000 },
            )
            .then(({ data: session }) => {
              if (!session?.token || !session?.refresh_token)
                throw new Error('A API não retornou uma sessão válida.');
              cookies = {
                ...cookies,
                'nextauth.token': session.token,
                'nextauth.refreshToken': session.refresh_token,
              };
              for (const key of ['nextauth.token', 'nextauth.refreshToken'])
                setCookie(ctx, key, cookies[key], {
                  maxAge: 60 * 60 * 25 * 30,
                  path: '/',
                });
              return session.token;
            })
            .catch((refreshError) => {
              if (refreshError.response?.status === 401)
                throw new AuthTokenError();
              throw refreshError;
            })
            .finally(() => {
              serverRefresh = undefined;
            });
          token = await serverRefresh;
        }
      }

      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      (api.defaults.headers as any)['Authorization'] = `Bearer ${token}`;
      original.sstAuthRetried = true;
      original.headers['Authorization'] = `Bearer ${token}`;
      return api(original);
    },
  );

  return api;
}
