/** Only actual anonymous API surfaces. In particular /refresh, company health,
 * document downloads and editor routes are not public logout exceptions. Site
 * PDFs/images are fetched from static assets and do not use this API client. */
const publicRoutes: Record<string, ReadonlySet<string>> = {
  GET: new Set([
    '/v2/public/login-stats',
    '/employee-history/exam/schedule/clinic/time',
  ]),
  POST: new Set([
    '/session',
    '/session/google',
    '/users',
    '/v2/sessions/signin',
    '/forgot-password',
  ]),
  PATCH: new Set(['/users/reset-password']),
};

function requestPath(
  url: string | undefined,
  baseURL?: string,
): string | undefined {
  if (!url || url.includes('\\')) return;
  try {
    const absolute = /^[a-z][a-z\d+.-]*:/i.test(url) || url.startsWith('//');
    if (absolute) {
      if (!baseURL) return;
      const base = new URL(baseURL);
      const parsed = new URL(url, base);
      if (parsed.origin !== base.origin) return;
      return parsed.pathname.replace(/\/$/, '') || '/';
    }
    return (
      new URL(
        url.startsWith('/') ? url : '/' + url,
        'https://local.invalid',
      ).pathname.replace(/\/$/, '') || '/'
    );
  } catch {
    return;
  }
}

export function isPublicAuthRequest(
  method: string | undefined,
  url: string | undefined,
  baseURL?: string,
): boolean {
  const path = requestPath(url, baseURL);
  if (!path) return false;
  const verb = (method || 'GET').toUpperCase();
  if (publicRoutes[verb]?.has(path)) return true;
  const match = /^\/v2\/forms\/applications\/([^/]+)\/public(\/login)?$/.exec(
    path,
  );
  if (!match) return false;
  try {
    const id = decodeURIComponent(match[1]);
    if (!id || id === '.' || id === '..' || /[/\\]/.test(id)) return false;
  } catch {
    return false;
  }
  return match[2] ? verb === 'POST' : verb === 'GET' || verb === 'POST';
}

export function canRequestAfterSessionEnd(input: {
  isBrowser: boolean;
  ended: boolean;
  method?: string;
  url?: string;
  baseURL?: string;
}): boolean {
  return (
    !input.isBrowser ||
    !input.ended ||
    isPublicAuthRequest(input.method, input.url, input.baseURL)
  );
}

type DraftStorage = { removeItem(key: string): void; [key: string]: unknown };
export function purgeSessionDrafts(browser: {
  readonly sessionStorage?: DraftStorage;
  readonly localStorage?: DraftStorage;
}): void {
  // Storage may be denied by browser policy. Draft cleanup is best effort and
  // must never prevent cookie/header/user cleanup or another storage attempt.
  for (const name of ['sessionStorage', 'localStorage'] as const) {
    try {
      const storage = browser[name];
      if (!storage) continue;
      for (const key of Object.keys(storage)) {
        if (!key.startsWith('sst-')) continue;
        try {
          storage.removeItem(key);
        } catch {
          /* Continue with the other drafts. */
        }
      }
    } catch {
      /* Access/enumeration can throw SecurityError. Try the next store. */
    }
  }
}
