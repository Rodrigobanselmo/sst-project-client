import { Node } from '@tiptap/core';

export const DocumentDoc = Node.create({
  name: 'doc',
  topNode: true,
  content: 'docGroup*',

  addAttributes() {
    return {
      variables: { default: [] },
    };
  },
});

export const DocumentGroup = Node.create({
  name: 'docGroup',
  content: 'docSection*',
  isolating: true,

  addAttributes() {
    return {
      label: { default: null },
      hadChildrenMap: { default: false },
    };
  },

  parseHTML() {
    return [{ tag: 'section[data-doc-group]' }];
  },

  renderHTML() {
    return ['section', { 'data-doc-group': '' }, 0];
  },
});

export const DocumentSection = Node.create({
  name: 'docSection',
  content: 'block*',
  isolating: true,

  addAttributes() {
    return {
      id: { default: null },
      type: { default: 'SECTION' },
      childrenOrigin: { default: 'none' },
      source: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: 'section[data-doc-section]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'section',
      {
        'data-doc-section': HTMLAttributes.type,
        'data-doc-id': HTMLAttributes.id,
      },
      0,
    ];
  },
});
