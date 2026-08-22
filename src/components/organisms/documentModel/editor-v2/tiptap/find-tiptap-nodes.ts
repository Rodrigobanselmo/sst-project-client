import { JSONContent } from '@tiptap/core';

export function walkTipTapNodes(
  node: JSONContent,
  visit: (node: JSONContent) => void,
) {
  visit(node);
  (node.content || []).forEach((child) => walkTipTapNodes(child, visit));
}

export function findTipTapNode(
  doc: JSONContent,
  predicate: (node: JSONContent) => boolean,
): JSONContent | undefined {
  let found: JSONContent | undefined;
  walkTipTapNodes(doc, (node) => {
    if (!found && predicate(node)) found = node;
  });
  return found;
}

export function findTipTapParagraph(
  doc: JSONContent,
  id: string,
): JSONContent | undefined {
  return findTipTapNode(
    doc,
    (node) => node.type === 'docParagraph' && node.attrs?.id === id,
  );
}

export function findTipTapBullet(
  doc: JSONContent,
  id: string,
): JSONContent | undefined {
  return findTipTapNode(
    doc,
    (node) => node.type === 'docBullet' && node.attrs?.id === id,
  );
}
