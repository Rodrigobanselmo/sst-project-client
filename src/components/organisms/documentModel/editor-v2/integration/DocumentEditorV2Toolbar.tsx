import React from 'react';

import { Button, Stack } from '@mui/material';
import { Editor } from '@tiptap/react';

function promptExternalLink(editor: Editor) {
  const previous = String(editor.getAttributes('link').href || '');
  const href = window.prompt('URL do link externo', previous || 'https://');
  if (href === null) return;
  if (!href.trim()) {
    editor.chain().focus().unsetLink().run();
    return;
  }
  editor.chain().focus().setLink({ href: href.trim(), target: '_blank' }).run();
}

export function DocumentEditorV2Toolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return null;

  return (
    <Stack direction="row" spacing={0.5} sx={{ mb: 1 }}>
      <Button
        size="small"
        variant={editor.isActive('bold') ? 'contained' : 'outlined'}
        onClick={() => editor.chain().focus().toggleBold().run()}
        sx={{ minWidth: 36, fontWeight: 700 }}
      >
        B
      </Button>
      <Button
        size="small"
        variant={editor.isActive('italic') ? 'contained' : 'outlined'}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        sx={{ minWidth: 36, fontStyle: 'italic' }}
      >
        I
      </Button>
      <Button
        size="small"
        variant={editor.isActive('underline') ? 'contained' : 'outlined'}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        sx={{ minWidth: 36, textDecoration: 'underline' }}
      >
        U
      </Button>
      <Button
        size="small"
        variant={editor.isActive('link') ? 'contained' : 'outlined'}
        onClick={() => promptExternalLink(editor)}
      >
        Link
      </Button>
    </Stack>
  );
}
