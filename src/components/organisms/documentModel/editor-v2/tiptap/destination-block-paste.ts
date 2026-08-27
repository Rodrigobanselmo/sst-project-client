import { Fragment, Node as ProseMirrorNode, Slice } from '@tiptap/pm/model';
import { EditorState, Plugin, PluginKey, Transaction } from '@tiptap/pm/state';
import { EditorView } from '@tiptap/pm/view';

/**
 * Unmatched clipboard HTML (generic `<p>` / plain text) does not hit the
 * strict `p[data-doc-*]` parse rules. ProseMirror then wraps with
 * `docSection.contentMatch.defaultType`. That default used to be
 * `docHeading` (registered first, `headingType` default `'H1'`), so
 * replace/paste inside a Paragraph became H1.
 *
 * Paste into an existing textual block remaps every textual block in the
 * slice to the destination node type + structural attrs. Inline marks,
 * variables and atoms are left intact — content is reused, never flattened
 * via `textContent`.
 */
export const TEXTUAL_PASTE_BLOCK_NAMES = new Set([
  'docParagraph',
  'docHeading',
  'docBullet',
  'docCaption',
]);

export function isTextualPasteBlock(node: ProseMirrorNode) {
  return TEXTUAL_PASTE_BLOCK_NAMES.has(node.type.name);
}

export function findDestinationTextualBlock(
  state: EditorState,
): { pos: number; node: ProseMirrorNode } | null {
  const $pos = state.selection.$from;
  for (let depth = $pos.depth; depth > 0; depth -= 1) {
    const node = $pos.node(depth);
    if (isTextualPasteBlock(node)) {
      return { pos: $pos.before(depth), node };
    }
  }
  return null;
}

function attrsForPastedBlock(
  destination: ProseMirrorNode,
  keepDestinationId: boolean,
) {
  if (keepDestinationId) return destination.attrs;
  const source = destination.attrs.source
    ? { ...destination.attrs.source, id: null }
    : null;
  return {
    ...destination.attrs,
    id: null,
    source,
  };
}

function remapNodeToDestination(
  node: ProseMirrorNode,
  destination: ProseMirrorNode,
  takeDestinationId: () => boolean,
): ProseMirrorNode {
  if (node.type.name === 'docAtom') return node;
  if (node.isInline) return node;

  if (isTextualPasteBlock(node)) {
    if (destination.type.validContent(node.content)) {
      return destination.type.create(
        attrsForPastedBlock(destination, takeDestinationId()),
        node.content,
        node.marks,
      );
    }
    return node;
  }

  if (node.content.size === 0) return node;

  const mapped: ProseMirrorNode[] = [];
  node.content.forEach((child) => {
    mapped.push(remapNodeToDestination(child, destination, takeDestinationId));
  });
  return node.type.create(node.attrs, Fragment.from(mapped), node.marks);
}

export function remapPastedSliceToDestination(
  slice: Slice,
  destination: ProseMirrorNode,
): Slice {
  if (!isTextualPasteBlock(destination) || slice.content.size === 0) {
    return slice;
  }

  let usedDestinationId = false;
  const takeDestinationId = () => {
    if (usedDestinationId) return false;
    usedDestinationId = true;
    return true;
  };

  const mapped: ProseMirrorNode[] = [];
  slice.content.forEach((child) => {
    mapped.push(remapNodeToDestination(child, destination, takeDestinationId));
  });
  return new Slice(Fragment.from(mapped), slice.openStart, slice.openEnd);
}

export function createDestinationAwarePasteTransaction(
  state: EditorState,
  slice: Slice,
): Transaction | null {
  const destination = findDestinationTextualBlock(state);
  if (!destination) return null;
  return state.tr
    .replaceSelection(remapPastedSliceToDestination(slice, destination.node))
    .scrollIntoView();
}

export function applyDestinationAwarePaste(
  state: EditorState,
  slice: Slice,
): EditorState {
  const transaction = createDestinationAwarePasteTransaction(state, slice);
  if (!transaction) {
    return state.apply(state.tr.replaceSelection(slice));
  }
  return state.apply(transaction);
}

export function createDestinationBlockPastePlugin() {
  return new Plugin({
    key: new PluginKey('documentEditorDestinationBlockPaste'),
    props: {
      handlePaste(view: EditorView, _event: ClipboardEvent, slice: Slice) {
        const transaction = createDestinationAwarePasteTransaction(
          view.state,
          slice,
        );
        if (!transaction) return false;
        view.dispatch(transaction);
        return true;
      },
    },
  });
}
