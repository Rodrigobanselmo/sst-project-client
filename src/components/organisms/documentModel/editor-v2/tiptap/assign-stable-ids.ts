import { Node as ProseMirrorNode } from '@tiptap/pm/model';
import { EditorState, Transaction } from '@tiptap/pm/state';

import {
  createDocumentEditorId,
  DocumentEditorIdFactory,
} from '../domain/document-editor-id';

export const ID_STABILIZED_NODES = new Set([
  'docParagraph',
  'docBullet',
  'docHeading',
  'docCaption',
  'docAtom',
]);

/**
 * Tipo gravado no source só quando um id novo é atribuído.
 * docBullet novo é sempre BULLET: split/paste de BULLET_SPACE não deve
 * clonar o tipo legado (Enter depois de BULLET_SPACE cria BULLET).
 */
function typeForNewId(node: ProseMirrorNode): string {
  if (node.type.name === 'docHeading') {
    return String(node.attrs.headingType || node.attrs.source?.type || 'H2');
  }
  if (node.type.name === 'docCaption') {
    return String(node.attrs.captionType || node.attrs.source?.type || 'LEGEND');
  }
  if (node.type.name === 'docAtom') {
    return String(node.attrs.atomType || node.attrs.source?.type || 'UNKNOWN');
  }
  if (node.type.name === 'docBullet') {
    return 'BULLET';
  }
  return 'PARAGRAPH';
}

export function assignStableIds(
  newState: EditorState,
  createId: DocumentEditorIdFactory,
): Transaction | null {
  let tr = newState.tr;
  let changed = false;
  const seen = new Set<string>();

  newState.doc.descendants((node, pos) => {
    if (!ID_STABILIZED_NODES.has(node.type.name)) return;
    const currentId = node.attrs.id;
    if (typeof currentId === 'string' && currentId && !seen.has(currentId)) {
      seen.add(currentId);
      return;
    }

    const nextId = createId();
    const type = typeForNewId(node);
    const source = node.attrs.source
      ? { ...node.attrs.source, id: nextId, type }
      : {
          id: nextId,
          type,
          text: node.type.name === 'docAtom' ? node.attrs.source?.text || '' : node.textContent,
        };

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
  createId: DocumentEditorIdFactory = createDocumentEditorId,
): EditorState {
  const transaction = assignStableIds(state, createId);
  return transaction ? state.apply(transaction) : state;
}
