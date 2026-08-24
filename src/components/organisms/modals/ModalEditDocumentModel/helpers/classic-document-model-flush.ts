type ClassicDocumentModelFlush = () => void;

let activeFlush: ClassicDocumentModelFlush | null = null;

export function registerClassicDocumentModelFlush(
  flush: ClassicDocumentModelFlush,
): () => void {
  activeFlush = flush;
  return () => {
    if (activeFlush === flush) activeFlush = null;
  };
}

export function flushActiveClassicDocumentModelEditor(): boolean {
  if (!activeFlush) return false;
  activeFlush();
  return true;
}

export function hasActiveClassicDocumentModelFlush(): boolean {
  return typeof activeFlush === 'function';
}
