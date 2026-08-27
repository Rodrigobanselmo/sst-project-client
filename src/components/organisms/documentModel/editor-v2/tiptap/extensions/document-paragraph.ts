import { Node, mergeAttributes } from '@tiptap/core';

import { blockVisualStyle } from './document-visual-css';

export const DocumentParagraph = Node.create({
  name: 'docParagraph',
  group: 'block',
  content: 'inline*',

  addAttributes() {
    return {
      id: { default: null },
      align: { default: null },
      size: { default: null },
      color: { default: null },
      lineHeight: { default: null },
      lineHeightBlock: { default: null },
      source: { default: null },
    };
  },

  parseHTML() {
    return [
      { tag: 'p[data-doc-paragraph]' },
      // Clipboard `<p>` without data-doc-* must not fall through to the
      // section defaultType. Bullet/caption keep the more specific
      // `p[data-doc-bullet]` / `p[data-doc-caption]` rules.
      { tag: 'p', priority: 20 },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'p',
      mergeAttributes({
        'data-doc-paragraph': '',
        'data-doc-id': HTMLAttributes.id,
        style: blockVisualStyle(HTMLAttributes),
      }),
      0,
    ];
  },
});
