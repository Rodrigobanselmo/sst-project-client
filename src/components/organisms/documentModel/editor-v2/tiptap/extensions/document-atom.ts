import { Node, mergeAttributes } from '@tiptap/core';

function atomLabel(type?: string, source?: { orientation?: string } | null) {
  if (type === 'SECTION_BREAK') {
    const orientation =
      source?.orientation === 'landscape' ? 'Paisagem' : 'Retrato';
    return `SECTION_BREAK — ${orientation}`;
  }
  return type || 'UNKNOWN';
}

export const DocumentAtom = Node.create({
  name: 'docAtom',
  group: 'block',
  atom: true,
  selectable: true,
  draggable: false,

  addAttributes() {
    return {
      id: { default: null },
      atomType: { default: 'UNKNOWN' },
      source: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-doc-atom]' }];
  },

  renderHTML({ HTMLAttributes }) {
    const label = atomLabel(HTMLAttributes.atomType, HTMLAttributes.source);
    return [
      'div',
      mergeAttributes({
        'data-doc-atom': HTMLAttributes.atomType,
        'data-doc-id': HTMLAttributes.id,
        class: 'doc-editor-v2-atom',
      }),
      `[ ${label} ]`,
    ];
  },
});
