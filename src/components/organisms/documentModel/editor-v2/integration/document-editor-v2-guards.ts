import { BLOCK_FORMAT_META } from '../domain/block-format';

type TipTapLikeNode = {
  type: { name: string };
  attrs?: { id?: string | null };
};

type TipTapLikeDoc = {
  descendants: (fn: (node: TipTapLikeNode) => boolean | void) => void;
};

export function collectProtectedNodeKeys(doc: TipTapLikeDoc): string[] {
  const keys: string[] = [];
  doc.descendants((node) => {
    if (
      (node.type.name === 'docAtom' ||
        node.type.name === 'docHeading' ||
        node.type.name === 'docCaption') &&
      node.attrs?.id
    ) {
      keys.push(`${node.type.name}:${node.attrs.id}`);
    }
  });
  return keys;
}

function collectNodeIds(doc: TipTapLikeDoc, names: readonly string[]): string[] {
  const ids: string[] = [];
  doc.descendants((node) => {
    if (names.includes(node.type.name) && node.attrs?.id) {
      ids.push(String(node.attrs.id));
    }
  });
  return ids;
}

export function allowDocumentEditorV2Transaction(
  tr: {
    docChanged: boolean;
    doc: TipTapLikeDoc;
    getMeta?: (key: string) => unknown;
  },
  state: { doc: TipTapLikeDoc },
): boolean {
  if (!tr.docChanged) return true;

  const atomsBefore = collectNodeIds(state.doc, ['docAtom']);
  const atomsAfter = collectNodeIds(tr.doc, ['docAtom']);
  if (!atomsBefore.every((id) => atomsAfter.includes(id))) return false;

  if (tr.getMeta?.(BLOCK_FORMAT_META)) {
    const headingIds = collectNodeIds(state.doc, ['docHeading']);
    const survivingIds = collectNodeIds(tr.doc, [
      'docHeading',
      'docParagraph',
      'docBullet',
    ]);
    return headingIds.every((id) => survivingIds.includes(id));
  }

  const before = collectProtectedNodeKeys(state.doc);
  const after = collectProtectedNodeKeys(tr.doc);
  return before.every((key) => after.includes(key));
}
