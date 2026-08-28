import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import type { EditorView } from '@tiptap/pm/view';

import { createReentrancyGuard } from 'components/organisms/documentModel/external-edit/document-editor-external-mutation';
import { registerV2ExternalEditSync } from 'components/organisms/modals/ModalEditDocumentModel/helpers/document-model-external-sync';

import {
  createProseMirrorExternalTextTransaction,
  readV2BlockVisibleTexts,
  readV2EditableTextsFromState,
} from './v2-external-edit-bridge';
import { normalizeExternalEditableText } from 'components/organisms/documentModel/external-edit/document-editor-external-mutation';

type DomObserverLike = {
  flush: () => void;
};

function getDomObserver(view: EditorView): DomObserverLike | null {
  const observer = (view as unknown as { domObserver?: DomObserverLike })
    .domObserver;
  if (!observer || typeof observer.flush !== 'function') return null;
  return observer;
}

export function attachV2ExternalEditObserver(
  view: EditorView,
  options: {
    onReconciled?: (result: { ok: boolean; changed: boolean }) => void;
  } = {},
): {
  syncNow: () => { ok: boolean; changed: boolean };
  destroy: () => void;
} {
  const guard = createReentrancyGuard();
  let destroyed = false;
  const observer = getDomObserver(view);
  const originalFlush = observer?.flush;

  const readDomSnapshot = () => readV2BlockVisibleTexts(view.dom);

  const syncFromSnapshot = (
    snapshot: ReturnType<typeof readV2BlockVisibleTexts>,
  ): { ok: boolean; changed: boolean } => {
    if (destroyed) return { ok: true, changed: false };
    if (guard.ignoreIfApplying()) return { ok: false, changed: false };

    const tr = createProseMirrorExternalTextTransaction(view.state, snapshot);
    if (!tr || !tr.docChanged) {
      return { ok: true, changed: false };
    }

    guard.run(() => {
      view.dispatch(tr);
    });

    const domAfter = readDomSnapshot();
    const pmAfter = readV2EditableTextsFromState(view.state);
    for (const dom of domAfter) {
      const pm = pmAfter.find((item) => item.blockId === dom.blockId);
      if (!pm) continue;
      const domNorm = normalizeExternalEditableText(dom.text);
      const pmNorm = normalizeExternalEditableText(pm.text);
      if (domNorm !== pmNorm) {
        return { ok: false, changed: false };
      }
    }

    return { ok: true, changed: true };
  };

  const flushDomObserver = () => {
    if (originalFlush) {
      guard.run(() => originalFlush.call(observer));
    }
  };

  const syncNow = (): { ok: boolean; changed: boolean } => {
    if (destroyed) return { ok: true, changed: false };
    if (guard.ignoreIfApplying()) return { ok: false, changed: false };
    const snapshot = readDomSnapshot();
    const result = syncFromSnapshot(snapshot);
    flushDomObserver();
    options.onReconciled?.(result);
    return result;
  };

  if (observer && originalFlush) {
    observer.flush = () => {
      if (destroyed) {
        originalFlush.call(observer);
        return;
      }
      if (guard.ignoreIfApplying()) {
        originalFlush.call(observer);
        return;
      }
      syncNow();
    };
  }

  let mutationObserver: MutationObserver | null = null;
  if (typeof MutationObserver === 'function') {
    mutationObserver = new MutationObserver(() => {
      if (destroyed || guard.ignoreIfApplying()) return;
      syncNow();
    });
    mutationObserver.observe(view.dom, {
      characterData: true,
      childList: true,
      subtree: true,
    });
  }

  const onInput = () => {
    if (destroyed || guard.ignoreIfApplying()) return;
    const domTexts = readDomSnapshot();
    const pmTexts = readV2EditableTextsFromState(view.state);
    const hasExternalDrift = domTexts.some((dom) => {
      const pm = pmTexts.find((item) => item.blockId === dom.blockId);
      if (!pm) return false;
      return (
        normalizeExternalEditableText(dom.text) !==
        normalizeExternalEditableText(pm.text)
      );
    });
    if (hasExternalDrift) syncNow();
  };
  view.dom.addEventListener('input', onInput);

  return {
    syncNow,
    destroy: () => {
      destroyed = true;
      mutationObserver?.disconnect();
      view.dom.removeEventListener?.('input', onInput);
      if (observer && originalFlush) {
        observer.flush = originalFlush;
      }
    },
  };
}

export const AbsorbExternalMutations = Extension.create({
  name: 'absorbExternalMutations',

  addOptions() {
    return {
      onExternalReconcile: undefined as
        | ((result: { ok: boolean; changed: boolean }) => void)
        | undefined,
    };
  },

  addProseMirrorPlugins() {
    const onExternalReconcile = this.options.onExternalReconcile;
    return [
      new Plugin({
        key: new PluginKey('absorbExternalMutations'),
        view(editorView) {
          const handle = attachV2ExternalEditObserver(editorView, {
            onReconciled: onExternalReconcile,
          });
          const unregister = registerV2ExternalEditSync(() => handle.syncNow());
          return {
            destroy() {
              unregister();
              handle.destroy();
            },
          };
        },
      }),
    ];
  },
});
