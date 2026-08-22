import { Mark, mergeAttributes } from '@tiptap/core';

import { inlineStyleCss } from './document-visual-css';

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
        style: inlineStyleCss(HTMLAttributes.style, HTMLAttributes.value),
      }),
      0,
    ];
  },
});
