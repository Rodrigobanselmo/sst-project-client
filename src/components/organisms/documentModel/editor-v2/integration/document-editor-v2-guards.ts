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
      (node.type.name === 'docAtom' || node.type.name === 'docHeading') &&
      node.attrs?.id
    ) {
      keys.push(`${node.type.name}:${node.attrs.id}`);
    }
  });
  return keys;
}

export function allowDocumentEditorV2Transaction(
  tr: { docChanged: boolean; doc: TipTapLikeDoc },
  state: { doc: TipTapLikeDoc },
): boolean {
  if (!tr.docChanged) return true;
  const before = collectProtectedNodeKeys(state.doc);
  const after = collectProtectedNodeKeys(tr.doc);
  return before.every((key) => after.includes(key));
}
