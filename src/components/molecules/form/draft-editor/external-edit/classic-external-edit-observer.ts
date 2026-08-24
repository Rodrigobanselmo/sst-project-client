import { EditorState } from 'draft-js';

import {
  blockKeyFromOffsetKey,
  createReentrancyGuard,
  collectVisibleText,
} from 'components/organisms/documentModel/external-edit/document-editor-external-mutation';

import {
  ClassicBlockDomText,
  reconcileDraftFromBlockTexts,
} from './classic-external-edit-bridge';

export type ClassicExternalEditObserverHandle = {
  syncNow: () => { ok: boolean; changed: boolean };
  destroy: () => void;
};

type DraftDomRoot = {
  querySelectorAll: (selector: string) => ArrayLike<{
    getAttribute: (name: string) => string | null;
    nodeType?: number;
    childNodes?: ArrayLike<unknown>;
  }>;
  addEventListener?: (
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ) => void;
  removeEventListener?: (
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions,
  ) => void;
};

export function readDraftBlockTextsFromRoot(
  root: DraftDomRoot,
): ClassicBlockDomText[] {
  const nodes = root.querySelectorAll('[data-block="true"]');
  const fallback =
    nodes.length > 0
      ? nodes
      : root.querySelectorAll('.public-DraftStyleDefault-block');
  const out: ClassicBlockDomText[] = [];
  const seen = new Set<string>();
  for (let i = 0; i < fallback.length; i += 1) {
    const el = fallback[i];
    const offsetKey = el.getAttribute('data-offset-key') || '';
    const blockKey = blockKeyFromOffsetKey(offsetKey);
    if (!blockKey || seen.has(blockKey)) continue;
    seen.add(blockKey);
    out.push({
      blockKey,
      text: collectVisibleText(el),
    });
  }
  return out;
}

export function attachClassicExternalEditObserver(args: {
  root: DraftDomRoot;
  getEditorState: () => EditorState;
  applyEditorState: (next: EditorState) => void;
}): ClassicExternalEditObserverHandle {
  const guard = createReentrancyGuard();
  let destroyed = false;
  let raf: number | null = null;

  const reconcile = (): { ok: boolean; changed: boolean } => {
    if (destroyed) return { ok: true, changed: false };
    if (guard.ignoreIfApplying()) return { ok: false, changed: false };

    const current = args.getEditorState();
    const blocks = readDraftBlockTextsFromRoot(args.root);
    const result = reconcileDraftFromBlockTexts(current, blocks);
    if (!result.changed) return { ok: true, changed: false };

    guard.run(() => {
      args.applyEditorState(result.editorState);
    });
    return { ok: true, changed: true };
  };

  const schedule = () => {
    if (destroyed || guard.ignoreIfApplying()) return;
    if (typeof requestAnimationFrame !== 'function') {
      reconcile();
      return;
    }
    if (raf != null) return;
    raf = requestAnimationFrame(() => {
      raf = null;
      reconcile();
    });
  };

  let observer: MutationObserver | null = null;
  if (typeof MutationObserver === 'function') {
    observer = new MutationObserver((mutations) => {
      if (destroyed || guard.ignoreIfApplying()) return;
      if (!mutations.length) return;
      schedule();
    });
    observer.observe(args.root as unknown as Node, {
      characterData: true,
      characterDataOldValue: false,
      childList: true,
      subtree: true,
    });
  }

  const onInput = () => schedule();
  args.root.addEventListener?.('input', onInput);

  return {
    syncNow: () => {
      if (raf != null && typeof cancelAnimationFrame === 'function') {
        cancelAnimationFrame(raf);
        raf = null;
      }
      return reconcile();
    },
    destroy: () => {
      destroyed = true;
      if (raf != null && typeof cancelAnimationFrame === 'function') {
        cancelAnimationFrame(raf);
      }
      observer?.disconnect();
      args.root.removeEventListener?.('input', onInput);
    },
  };
}
