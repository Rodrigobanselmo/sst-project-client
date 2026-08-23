import { Node, mergeAttributes } from '@tiptap/core';

import { documentEditorV2BulletStyleVars } from './document-bullet-indent';
import { blockVisualStyle } from './document-visual-css';

export const DocumentBullet = Node.create({
  name: 'docBullet',
  group: 'block',
  content: 'inline*',

  addAttributes() {
    return {
      id: { default: null },
      level: { default: 0 },
      align: { default: null },
      size: { default: null },
      color: { default: null },
      lineHeight: { default: null },
      lineHeightBlock: { default: null },
      source: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: 'p[data-doc-bullet]' }];
  },

  renderHTML({ HTMLAttributes }) {
    const level = Number(HTMLAttributes.level || 0);
    const visual = blockVisualStyle(HTMLAttributes);

    return [
      'p',
      mergeAttributes({
        'data-doc-bullet': '',
        'data-doc-id': HTMLAttributes.id,
        'data-bullet-level': level,
        style: [visual, documentEditorV2BulletStyleVars(level)]
          .filter(Boolean)
          .join(';'),
      }),
      0,
    ];
  },
});
