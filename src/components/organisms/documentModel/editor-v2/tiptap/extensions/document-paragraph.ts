import { Node, mergeAttributes } from '@tiptap/core';

function cssAlign(align?: string | null) {
  if (align === 'both' || align === 'justified') return 'justify';
  if (align === 'start') return 'left';
  if (align === 'end') return 'right';
  return align || undefined;
}

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
    return [{ tag: 'p[data-doc-paragraph]' }];
  },

  renderHTML({ HTMLAttributes }) {
    const align = cssAlign(HTMLAttributes.align);
    const lineHeight = HTMLAttributes.lineHeight;

    return [
      'p',
      mergeAttributes({
        'data-doc-paragraph': '',
        'data-doc-id': HTMLAttributes.id,
        style: [
          align ? `text-align:${align}` : '',
          lineHeight != null ? `line-height:${lineHeight}` : '',
        ]
          .filter(Boolean)
          .join(';'),
      }),
      0,
    ];
  },
});
