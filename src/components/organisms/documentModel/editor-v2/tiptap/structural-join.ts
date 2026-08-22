import { EditorState, TextSelection, Transaction } from '@tiptap/pm/state';
import { canJoin, canSplit } from '@tiptap/pm/transform';

import { snapSplitOffset } from '../domain/structural-edit';

export const STRUCTURAL_EDITABLE_NODES = new Set(['docParagraph', 'docBullet']);

export const STRUCTURAL_PROTECTED_NODES = new Set([
  'docHeading',
  'docAtom',
  'docCaption',
]);

export type StructuralJoinDecision =
  | { type: 'ignore' }
  | { type: 'block' }
  | { type: 'join'; pos: number };

function isProtectedNodeName(name: string) {
  return STRUCTURAL_PROTECTED_NODES.has(name);
}

export function resolveStructuralJoinBackward(
  state: EditorState,
): StructuralJoinDecision {
  const { $from, empty } = state.selection;
  if (!empty || $from.parentOffset !== 0) {
    return { type: 'ignore' };
  }

  const parentName = $from.parent.type.name;

  // Heading/atom: never let default joinBackward / selectNodeBackward
  // pull or delete the previous sibling.
  if (isProtectedNodeName(parentName)) {
    return { type: 'block' };
  }

  if (!STRUCTURAL_EDITABLE_NODES.has(parentName)) {
    return { type: 'ignore' };
  }

  const $cut = state.doc.resolve($from.before($from.depth));
  const previous = $cut.nodeBefore;
  if (!previous) return { type: 'block' };
  if (
    isProtectedNodeName(previous.type.name) ||
    previous.type.name !== parentName
  ) {
    return { type: 'block' };
  }
  if (!canJoin(state.doc, $cut.pos)) return { type: 'block' };
  return { type: 'join', pos: $cut.pos };
}

export function resolveStructuralJoinForward(
  state: EditorState,
): StructuralJoinDecision {
  const { $from, empty } = state.selection;
  if (!empty || $from.parentOffset !== $from.parent.content.size) {
    return { type: 'ignore' };
  }

  const parentName = $from.parent.type.name;

  // Heading/atom at end: consume Delete. TipTap's default joinForward
  // would otherwise absorb the next textblock (caption/atom/paragraph)
  // into the heading — the homologation residual.
  if (isProtectedNodeName(parentName)) {
    return { type: 'block' };
  }

  if (!STRUCTURAL_EDITABLE_NODES.has(parentName)) {
    return { type: 'ignore' };
  }

  const $cut = state.doc.resolve($from.after($from.depth));
  const next = $cut.nodeAfter;
  if (!next) return { type: 'block' };
  if (isProtectedNodeName(next.type.name) || next.type.name !== parentName) {
    return { type: 'block' };
  }
  if (!canJoin(state.doc, $cut.pos)) return { type: 'block' };
  return { type: 'join', pos: $cut.pos };
}

export function applyStructuralJoin(
  state: EditorState,
  decision: StructuralJoinDecision,
): Transaction | null {
  if (decision.type !== 'join') return null;
  return state.tr.join(decision.pos).scrollIntoView();
}

export function applyStructuralJoinBackward(state: EditorState): {
  decision: StructuralJoinDecision;
  state: EditorState;
} {
  const decision = resolveStructuralJoinBackward(state);
  const transaction = applyStructuralJoin(state, decision);
  return {
    decision,
    state: transaction ? state.apply(transaction) : state,
  };
}

export function applyStructuralJoinForward(state: EditorState): {
  decision: StructuralJoinDecision;
  state: EditorState;
} {
  const decision = resolveStructuralJoinForward(state);
  const transaction = applyStructuralJoin(state, decision);
  return {
    decision,
    state: transaction ? state.apply(transaction) : state,
  };
}

export function createStructuralSplitTransaction(
  state: EditorState,
): Transaction | null {
  const { empty, $from } = state.selection;
  if (!empty || !STRUCTURAL_EDITABLE_NODES.has($from.parent.type.name)) {
    return null;
  }

  let tr = state.tr;
  const snapped = snapSplitOffset($from.parent.textContent, $from.parentOffset);
  if (snapped !== $from.parentOffset) {
    tr = tr.setSelection(
      TextSelection.create(state.doc, $from.start() + snapped),
    );
  }

  const $split = tr.selection.$from;
  const types = [
    {
      type: $split.parent.type,
      attrs: $split.parent.attrs,
    },
  ];
  if (!canSplit(tr.doc, $split.pos, 1, types)) return null;
  return tr.split($split.pos, 1, types).scrollIntoView();
}

export function applyStructuralSplit(state: EditorState): {
  ok: boolean;
  state: EditorState;
} {
  const transaction = createStructuralSplitTransaction(state);
  if (!transaction) return { ok: false, state };
  return { ok: true, state: state.apply(transaction) };
}
