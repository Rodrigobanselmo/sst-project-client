import axios from 'axios';

/** True when the AI analyze HTTP request was aborted/canceled by the client. */
export function isAiAnalyzeRequestCanceled(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;

  if (axios.isCancel(error)) return true;

  const maybe = error as {
    code?: string;
    name?: string;
    message?: string;
  };

  if (maybe.code === 'ERR_CANCELED') return true;
  if (maybe.name === 'CanceledError' || maybe.name === 'AbortError') return true;
  if (maybe.message === 'canceled' || maybe.message === 'Aborted') return true;

  return false;
}
