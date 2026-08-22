import { Node, mergeAttributes } from '@tiptap/core';

import { describeAtomVisual } from '../../domain/atom-visual';

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
      label: { default: null },
      source: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-doc-atom]' }];
  },

  renderHTML({ HTMLAttributes }) {
    const type = String(HTMLAttributes.atomType || 'UNKNOWN');
    const source = HTMLAttributes.source;
    const visual = describeAtomVisual(type, source);
    const category = visual.category;
    const label = HTMLAttributes.label || visual.label;
    const orientation =
      type === 'SECTION_BREAK'
        ? source?.orientation === 'landscape'
          ? 'landscape'
          : 'portrait'
        : undefined;

    const className = [
      'doc-editor-v2-atom',
      `doc-editor-v2-atom--${category}`,
      type === 'BREAK' ? 'doc-editor-v2-atom--break' : '',
      type === 'SECTION_BREAK' ? `doc-editor-v2-atom--${orientation}` : '',
    ]
      .filter(Boolean)
      .join(' ');

    return [
      'div',
      mergeAttributes({
        'data-doc-atom': type,
        'data-doc-atom-category': category,
        'data-doc-id': HTMLAttributes.id,
        class: className,
        contenteditable: 'false',
      }),
      [
        'span',
        { class: 'doc-editor-v2-atom-icon', 'aria-hidden': 'true' },
        visual.icon,
      ],
      [
        'span',
        { class: 'doc-editor-v2-atom-label' },
        label,
      ],
    ];
  },
});
