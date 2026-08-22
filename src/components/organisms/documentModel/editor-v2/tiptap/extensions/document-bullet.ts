import { Node, mergeAttributes } from '@tiptap/core';

function cssAlign(align?: string | null) {
  if (align === 'both' || align === 'justified') return 'justify';
  if (align === 'start') return 'left';
  if (align === 'end') return 'right';
  return align || undefined;
}

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
    const align = cssAlign(HTMLAttributes.align);
    const lineHeight = HTMLAttributes.lineHeight;
    const level = Number(HTMLAttributes.level || 0);

    return [
      'p',
      mergeAttributes({
        'data-doc-bullet': '',
        'data-doc-id': HTMLAttributes.id,
        'data-bullet-level': level,
        style: [
          align ? `text-align:${align}` : '',
          lineHeight != null ? `line-height:${lineHeight}` : '',
          `padding-left:${16 + level * 24}px`,
          `--doc-bullet-level:${level}`,
        ]
          .filter(Boolean)
          .join(';'),
      }),
      0,
    ];
  },
});
