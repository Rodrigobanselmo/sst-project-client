import { useEffect, useRef } from 'react';
import { useSnackbar } from 'notistack';
import {
  AI_ACCOUNTING_NOTICE,
  parseAiAccountingNotice,
} from './ai-accounting-notice';

/** Mounted once above every page so a budget refusal always has an explanation. */
export function AiAccountingNotice() {
  const { enqueueSnackbar } = useSnackbar();
  const previous = useRef({ key: '', at: 0 });
  useEffect(() => {
    const listener = (event: Event) => {
      const notice = parseAiAccountingNotice((event as CustomEvent).detail);
      if (!notice) return;
      const key = `${notice.code}:${notice.scope || ''}`;
      if (
        previous.current.key === key &&
        Date.now() - previous.current.at < 3000
      )
        return;
      previous.current = { key, at: Date.now() };
      enqueueSnackbar(notice.message, {
        variant: 'warning',
        autoHideDuration: 15000,
        preventDuplicate: true,
      });
    };
    window.addEventListener(AI_ACCOUNTING_NOTICE, listener);
    return () => window.removeEventListener(AI_ACCOUNTING_NOTICE, listener);
  }, [enqueueSnackbar]);
  return null;
}
