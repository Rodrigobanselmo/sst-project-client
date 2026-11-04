export const AI_ACCOUNTING_NOTICE = 'simplesst-ai-accounting-notice';
const codes = new Set([
  'ILLUSTRATION_LIMIT',
  'AI_DAILY_BUDGET_EXCEEDED',
  'AI_SPENDING_PAUSED',
  'AI_ACCOUNTING_UNAVAILABLE',
  'AI_PRICING_UNAVAILABLE',
  'AI_ATTRIBUTION_REQUIRED',
  'AI_ENDPOINT_NOT_METERED',
  'AI_METERING_REQUIRED',
  'AI_PROVIDER_NOT_REGISTERED',
]);
export type AiAccountingNoticeData = {
  code: string;
  message: string;
  resetAt?: string;
  scope?: string;
};
export function parseAiAccountingNotice(
  value: unknown,
): AiAccountingNoticeData | null {
  if (!value || typeof value !== 'object') return null;
  const v = value as Record<string, unknown>;
  if (
    typeof v.code !== 'string' ||
    !codes.has(v.code) ||
    typeof v.message !== 'string' ||
    !v.message ||
    v.message.length > 1200
  )
    return null;
  return {
    code: v.code,
    message: v.message,
    ...(typeof v.resetAt === 'string' ? { resetAt: v.resetAt } : {}),
    ...(typeof v.scope === 'string' ? { scope: v.scope } : {}),
  };
}
/** Shared by Axios, legacy fetch, chat SSE and audio. No retry of paid operations here. */
export function publishAiAccountingNotice(value: unknown): boolean {
  const notice = parseAiAccountingNotice(value);
  if (!notice) return false;
  if (typeof window !== 'undefined')
    window.dispatchEvent(
      new CustomEvent(AI_ACCOUNTING_NOTICE, { detail: notice }),
    );
  return true;
}

/** Downloads can request Blob/ArrayBuffer even when the server returns an error JSON. */
export async function publishAiAccountingFailure(
  value: unknown,
): Promise<boolean> {
  if (publishAiAccountingNotice(value)) return true;
  let text: string | undefined;
  if (typeof value === 'string' && value.length <= 16000) text = value;
  else if (
    typeof Blob !== 'undefined' &&
    value instanceof Blob &&
    value.size <= 16000
  )
    text = await value.text();
  else if (value instanceof ArrayBuffer && value.byteLength <= 16000)
    text = new TextDecoder().decode(value);
  if (!text) return false;
  try {
    return publishAiAccountingNotice(JSON.parse(text));
  } catch {
    return false;
  }
}
