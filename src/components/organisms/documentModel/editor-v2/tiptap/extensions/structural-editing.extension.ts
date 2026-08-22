import { Extension } from '@tiptap/core';
import { EditorState, Plugin, PluginKey } from '@tiptap/pm/state';

import {
  createDocumentEditorId,
  DocumentEditorIdFactory,
} from '../../domain/document-editor-id';
import {
  applyStructuralJoin,
  createStructuralSplitTransaction,
  resolveStructuralJoinBackward,
  resolveStructuralJoinForward,
  STRUCTURAL_EDITABLE_NODES,
  STRUCTURAL_PROTECTED_NODES,
} from '../structural-join';

function assignStableIds(
  newState: EditorState,
  createId: DocumentEditorIdFactory,
) {
  let tr = newState.tr;
  let changed = false;
  const seen = new Set<string>();

  newState.doc.descendants((node, pos) => {
    if (!STRUCTURAL_EDITABLE_NODES.has(node.type.name)) return;
    const currentId = node.attrs.id;
    if (typeof currentId === 'string' && currentId && !seen.has(currentId)) {
      seen.add(currentId);
      return;
    }

    const nextId = createId();
    const type = node.type.name === 'docBullet' ? 'BULLET' : 'PARAGRAPH';
    const source = node.attrs.source
      ? { ...node.attrs.source, id: nextId, type }
      : { id: nextId, type, text: node.textContent };

    tr = tr.setNodeMarkup(pos, undefined, {
      ...node.attrs,
      id: nextId,
      source,
    });
    seen.add(nextId);
    changed = true;
  });

  return changed ? tr : null;
}

export function applyStableEditableIds(
  state: EditorState,
  createId: DocumentEditorIdFactory,
): EditorState {
  const transaction = assignStableIds(state, createId);
  return transaction ? state.apply(transaction) : state;
}

export function createStructuralEditingExtension(
  createId: DocumentEditorIdFactory = createDocumentEditorId,
) {
  return Extension.create({
    name: 'documentEditorStructuralEditing',
    // Higher than the core TipTap keymap so Backspace/Delete join before
    // selectNodeBackward / deleteCurrentNode can swallow the key.
    priority: 1000,

    addKeyboardShortcuts() {
      return {
        Enter: ({ editor }) => {
          const { $from } = editor.state.selection;
          if (STRUCTURAL_PROTECTED_NODES.has($from.parent.type.name)) {
            return true;
          }
          if (!STRUCTURAL_EDITABLE_NODES.has($from.parent.type.name)) {
            return true;
          }

          const transaction = createStructuralSplitTransaction(editor.state);
          if (!transaction) return true;
          editor.view.dispatch(transaction);
          return true;
        },
        Backspace: ({ editor }) => {
          const decision = resolveStructuralJoinBackward(editor.state);
          if (decision.type === 'ignore') return false;
          if (decision.type === 'block') return true;
          const transaction = applyStructuralJoin(editor.state, decision);
          if (!transaction) return true;
          editor.view.dispatch(transaction);
          return true;
        },
        Delete: ({ editor }) => {
          const decision = resolveStructuralJoinForward(editor.state);
          if (decision.type === 'ignore') return false;
          if (decision.type === 'block') return true;
          const transaction = applyStructuralJoin(editor.state, decision);
          if (!transaction) return true;
          editor.view.dispatch(transaction);
          return true;
        },
      };
    },

    addProseMirrorPlugins() {
      return [
        new Plugin({
          key: new PluginKey('documentEditorStableIds'),
          appendTransaction(transactions, _oldState, newState) {
            if (!transactions.some((transaction) => transaction.docChanged)) {
              return null;
            }
            return assignStableIds(newState, createId);
          },
        }),
      ];
    },
  });
}
