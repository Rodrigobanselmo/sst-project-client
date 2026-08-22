import React from 'react';

import {
  Button,
  FormControl,
  IconButton,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import { Editor } from '@tiptap/react';

import {
  BLOCK_FORMAT_OPTIONS,
  BlockFormatType,
  BULLET_LEVEL_MAX,
  BULLET_LEVEL_MIN,
  isBlockFormatType,
} from '../domain/block-format';
import {
  createBlockFormatTransaction,
  createBulletLevelTransaction,
  resolveActiveBlock,
} from '../tiptap/apply-block-format';
import { DocumentEditorV2TextFormatControls } from './DocumentEditorV2TextFormatControls';

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

function selectLabel(active: ReturnType<typeof resolveActiveBlock>): string {
  if (active.kind === 'atom') return 'Elemento estrutural';
  if (active.kind === 'multi') return 'Vários blocos';
  if (active.kind === 'convertible') {
    return (
      BLOCK_FORMAT_OPTIONS.find((option) => option.value === active.format)
        ?.label || active.format
    );
  }
  return 'Parágrafo';
}

export function DocumentEditorV2Toolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return null;

  const active = resolveActiveBlock(editor.state);
  const selectValue = active.convertible ? active.format : '';
  const bulletLevel = active.kind === 'convertible' ? active.level ?? 0 : 0;

  return (
    <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap">
      <FormControl size="small" sx={{ minWidth: 148 }}>
        <Select
          size="small"
          displayEmpty
          disabled={!active.convertible}
          value={selectValue}
          renderValue={() => selectLabel(active)}
          onChange={(event) => {
            const next = String(event.target.value);
            if (!isBlockFormatType(next)) return;
            const transaction = createBlockFormatTransaction(
              editor.state,
              next as BlockFormatType,
            );
            if (transaction) editor.view.dispatch(transaction);
          }}
          sx={{ fontSize: 13, height: 32 }}
        >
          {BLOCK_FORMAT_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value} dense>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {active.kind === 'convertible' && active.format === 'BULLET' ? (
        <Stack direction="row" spacing={0.25} alignItems="center">
          <IconButton
            size="small"
            disabled={bulletLevel <= BULLET_LEVEL_MIN}
            onClick={() => {
              const transaction = createBulletLevelTransaction(
                editor.state,
                bulletLevel - 1,
              );
              if (transaction) editor.view.dispatch(transaction);
            }}
            aria-label="Diminuir nível do marcador"
          >
            −
          </IconButton>
          <Typography variant="caption" sx={{ minWidth: 52, textAlign: 'center' }}>
            Nível {bulletLevel}
          </Typography>
          <IconButton
            size="small"
            disabled={bulletLevel >= BULLET_LEVEL_MAX}
            onClick={() => {
              const transaction = createBulletLevelTransaction(
                editor.state,
                bulletLevel + 1,
              );
              if (transaction) editor.view.dispatch(transaction);
            }}
            aria-label="Aumentar nível do marcador"
          >
            +
          </IconButton>
        </Stack>
      ) : null}
      <DocumentEditorV2TextFormatControls editor={editor} />
      <Button
        size="small"
        variant={editor.isActive('bold') ? 'contained' : 'outlined'}
        disabled={active.kind === 'atom'}
        onClick={() => editor.chain().focus().toggleBold().run()}
        sx={{ minWidth: 36, fontWeight: 700 }}
      >
        B
      </Button>
      <Button
        size="small"
        variant={editor.isActive('italic') ? 'contained' : 'outlined'}
        disabled={active.kind === 'atom'}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        sx={{ minWidth: 36, fontStyle: 'italic' }}
      >
        I
      </Button>
      <Button
        size="small"
        variant={editor.isActive('underline') ? 'contained' : 'outlined'}
        disabled={active.kind === 'atom'}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        sx={{ minWidth: 36, textDecoration: 'underline' }}
      >
        U
      </Button>
      <Button
        size="small"
        variant={editor.isActive('link') ? 'contained' : 'outlined'}
        disabled={active.kind === 'atom'}
        onClick={() => promptExternalLink(editor)}
      >
        Link
      </Button>
    </Stack>
  );
}
