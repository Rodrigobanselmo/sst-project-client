import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import type { EditorView } from '@tiptap/pm/view';

import { createReentrancyGuard } from 'components/organisms/documentModel/external-edit/document-editor-external-mutation';
import { registerV2ExternalEditSync } from 'components/organisms/modals/ModalEditDocumentModel/helpers/document-model-external-sync';

import {
  createProseMirrorExternalTextTransaction,
  readV2BlockVisibleTexts,
} from './v2-external-edit-bridge';

type DomObserverLike = {
  flush: () => void;
};

function getDomObserver(view: EditorView): DomObserverLike | null {
  const observer = (view as unknown as { domObserver?: DomObserverLike })
    .domObserver;
  if (!observer || typeof observer.flush !== 'function') return null;
  return observer;
}

export function attachV2ExternalEditObserver(view: EditorView): {
  syncNow: () => { ok: boolean; changed: boolean };
  destroy: () => void;
} {
  const guard = createReentrancyGuard();
  let destroyed = false;
  const observer = getDomObserver(view);
  const originalFlush = observer?.flush;

  const syncFromSnapshot = (
    snapshot: ReturnType<typeof readV2BlockVisibleTexts>,
  ): { ok: boolean; changed: boolean } => {
    if (destroyed) return { ok: true, changed: false };
    if (guard.ignoreIfApplying()) return { ok: false, changed: false };

    const tr = createProseMirrorExternalTextTransaction(view.state, snapshot);
    if (!tr || !tr.docChanged) return { ok: true, changed: false };

    guard.run(() => {
      view.dispatch(tr);
    });
    return { ok: true, changed: true };
  };

  const syncNow = (): { ok: boolean; changed: boolean } => {
    if (destroyed) return { ok: true, changed: false };
    if (guard.ignoreIfApplying()) return { ok: false, changed: false };
    const snapshot = readV2BlockVisibleTexts(view.dom);
    if (originalFlush) {
      guard.run(() => originalFlush.call(observer));
    }
    return syncFromSnapshot(snapshot);
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
      const snapshot = readV2BlockVisibleTexts(view.dom);
      guard.run(() => originalFlush.call(observer));
      syncFromSnapshot(snapshot);
    };
  }

  let mutationObserver: MutationObserver | null = null;
  if (typeof MutationObserver === 'function') {
    mutationObserver = new MutationObserver(() => {
      if (destroyed || guard.ignoreIfApplying()) return;
      const snapshot = readV2BlockVisibleTexts(view.dom);
      if (originalFlush) {
        guard.run(() => originalFlush.call(observer));
      }
      syncFromSnapshot(snapshot);
    });
    mutationObserver.observe(view.dom, {
      characterData: true,
      childList: true,
      subtree: true,
    });
  }

  const onInput = () => {
    if (destroyed || guard.ignoreIfApplying()) return;
    syncNow();
  };
  view.dom.addEventListener('input', onInput);

  return {
    syncNow,
    destroy: () => {
      destroyed = true;
      mutationObserver?.disconnect();
      view.dom.removeEventListener('input', onInput);
      if (observer && originalFlush) {
        observer.flush = originalFlush;
      }
    },
  };
}

export const AbsorbExternalMutations = Extension.create({
  name: 'absorbExternalMutations',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('absorbExternalMutations'),
        view(editorView) {
          const handle = attachV2ExternalEditObserver(editorView);
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
