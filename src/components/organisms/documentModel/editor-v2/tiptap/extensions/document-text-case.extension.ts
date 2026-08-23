import { Extension } from '@tiptap/core';

import { createCycledChangeCaseTransaction } from '../apply-text-case';

export const DocumentTextCase = Extension.create({
  name: 'documentEditorTextCase',
  // Consume Shift+F3 while the editor is focused so Chrome Find Previous
  // does not steal the shortcut. If the browser find bar is already open,
  // the browser may still win. The Aa menu is the official path.
  priority: 1100,

  addKeyboardShortcuts() {
    return {
      'Shift-F3': ({ editor }) => {
        const transaction = createCycledChangeCaseTransaction(editor.state);
        if (transaction) editor.view.dispatch(transaction);
        return true;
      },
    };
  },
});
