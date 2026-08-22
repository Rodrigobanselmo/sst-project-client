import { Node, mergeAttributes } from '@tiptap/core';

import { captionChromeLabel } from '../../domain/caption-block';
import { blockVisualStyle } from './document-visual-css';

export const DocumentCaption = Node.create({
  name: 'docCaption',
  group: 'block',
  content: 'inline*',
  defining: true,

  addAttributes() {
    return {
      id: { default: null },
      captionType: { default: 'LEGEND' },
      align: { default: null },
      size: { default: null },
      color: { default: null },
      lineHeight: { default: null },
      lineHeightBlock: { default: null },
      source: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: 'p[data-doc-caption]' }];
  },

  renderHTML({ HTMLAttributes }) {
    const captionType = String(HTMLAttributes.captionType || 'LEGEND');
    return [
      'p',
      mergeAttributes({
        'data-doc-caption': captionType,
        'data-caption-label': captionChromeLabel(captionType),
        'data-doc-id': HTMLAttributes.id,
        style: blockVisualStyle(HTMLAttributes),
      }),
      0,
    ];
  },
});
