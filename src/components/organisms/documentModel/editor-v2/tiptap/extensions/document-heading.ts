import { Node, mergeAttributes } from '@tiptap/core';

const headingTag = (type?: string) => {
  if (type === 'H2') return 'h2';
  if (type === 'H3') return 'h3';
  if (type === 'H4') return 'h4';
  if (type === 'H5') return 'h5';
  if (type === 'H6') return 'h6';
  return 'h1';
};

export const DocumentHeading = Node.create({
  name: 'docHeading',
  group: 'block',
  content: 'inline*',
  defining: true,

  addAttributes() {
    return {
      id: { default: null },
      headingType: { default: 'H1' },
      headingNumber: { default: null },
      source: { default: null },
    };
  },

  parseHTML() {
    return [
      { tag: 'h1[data-doc-heading]' },
      { tag: 'h2[data-doc-heading]' },
      { tag: 'h3[data-doc-heading]' },
      { tag: 'h4[data-doc-heading]' },
      { tag: 'h5[data-doc-heading]' },
      { tag: 'h6[data-doc-heading]' },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      headingTag(HTMLAttributes.headingType),
      mergeAttributes({
        'data-doc-heading': HTMLAttributes.headingType,
        'data-doc-id': HTMLAttributes.id,
        'data-heading-number': HTMLAttributes.headingNumber || null,
      }),
      0,
    ];
  },
});
