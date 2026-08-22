import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';

import { allowDocumentEditorV2Transaction } from './document-editor-v2-guards';

export const ProtectV2Boundaries = Extension.create({
  name: 'protectV2Boundaries',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('protectV2Boundaries'),
        filterTransaction(tr, state) {
          return allowDocumentEditorV2Transaction(tr, state);
        },
      }),
    ];
  },
});
