import { Mark, mergeAttributes } from '@tiptap/core';

export const DocumentStyle = Mark.create({
  name: 'docStyle',
  excludes: '',
  inclusive: true,

  addAttributes() {
    return {
      style: { default: null },
      value: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-doc-style]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes({
        'data-doc-style': HTMLAttributes.style,
        'data-doc-value': HTMLAttributes.value ?? '',
      }),
      0,
    ];
  },
});
