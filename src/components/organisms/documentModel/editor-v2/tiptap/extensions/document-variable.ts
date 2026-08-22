import { Node, mergeAttributes } from '@tiptap/core';
import { Fragment, Slice } from '@tiptap/pm/model';
import { Plugin, PluginKey } from '@tiptap/pm/state';

import {
  resolveVariablePresentation,
  serializeVariableToken,
  tokenizeVariableLine,
  VariableCatalogEntry,
} from '../../domain/variable-token';

function catalogFromDoc(doc: { attrs?: { variables?: VariableCatalogEntry[] } }) {
  return (doc.attrs?.variables || []) as VariableCatalogEntry[];
}

export const DocumentVariable = Node.create({
  name: 'docVariable',
  group: 'inline',
  inline: true,
  atom: true,
  selectable: true,
  draggable: false,
  isolating: true,
  marks: '_',

  addAttributes() {
    return {
      type: { default: '' },
      label: { default: '' },
      unknown: { default: false },
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-doc-variable]' }];
  },

  renderHTML({ HTMLAttributes }) {
    const unknown = Boolean(HTMLAttributes.unknown);
    return [
      'span',
      mergeAttributes({
        'data-doc-variable': HTMLAttributes.type,
        'data-unknown': unknown ? 'true' : 'false',
        class: unknown
          ? 'doc-editor-v2-variable doc-editor-v2-variable--unknown'
          : 'doc-editor-v2-variable',
        contenteditable: 'false',
      }),
      HTMLAttributes.label || HTMLAttributes.type || 'variável',
    ];
  },

  renderText({ node }) {
    return serializeVariableToken(String(node.attrs.type || ''));
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('documentEditorVariableClipboard'),
        props: {
          clipboardTextSerializer: (slice) => {
            let text = '';
            slice.content.descendants((node) => {
              if (node.isText) {
                text += node.text || '';
                return;
              }
              if (node.type.name === 'docVariable') {
                text += serializeVariableToken(String(node.attrs.type || ''));
              }
              if (node.type.name === 'hardBreak') {
                text += '\n';
              }
            });
            return text;
          },
        },
        appendTransaction(transactions, _oldState, newState) {
          if (!transactions.some((transaction) => transaction.docChanged)) {
            return null;
          }

          const type = newState.schema.nodes.docVariable;
          if (!type) return null;

          const catalog = catalogFromDoc(newState.doc);
          const replacements: Array<{
            from: number;
            to: number;
            content: ReturnType<typeof Fragment.from>;
          }> = [];

          newState.doc.descendants((node, pos) => {
            if (!node.isText || !node.text) return;
            const tokens = tokenizeVariableLine(node.text);
            if (!tokens.some((token) => token.kind === 'variable')) return;

            const content = tokens.map((token) => {
              if (token.kind === 'text') {
                return newState.schema.text(token.text, node.marks);
              }
              const presentation = resolveVariablePresentation(
                token.type,
                catalog,
              );
              return type.create(
                {
                  type: presentation.type,
                  label: presentation.label,
                  unknown: presentation.unknown,
                },
                null,
                node.marks,
              );
            });

            replacements.push({
              from: pos,
              to: pos + node.nodeSize,
              content: Fragment.from(content),
            });
          });

          if (!replacements.length) return null;

          let tr = newState.tr;
          replacements
            .slice()
            .reverse()
            .forEach((item) => {
              tr = tr.replace(item.from, item.to, new Slice(item.content, 0, 0));
            });
          return tr;
        },
      }),
    ];
  },
});
