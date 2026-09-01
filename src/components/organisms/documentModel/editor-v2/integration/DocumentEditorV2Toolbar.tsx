import React from 'react';

import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import {
  Button,
  FormControl,
  IconButton,
  ListItemText,
  Menu,
  MenuItem,
  Select,
  Stack,
  Tooltip,
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
  CHANGE_CASE_CYCLE_TOOLTIP,
  CHANGE_CASE_MENU_ITEMS,
  TextCaseMode,
} from '../domain/text-case';
import {
  createBlockFormatTransaction,
  createBulletLevelTransaction,
  labelForActiveBlock,
  resolveActiveBlock,
} from '../tiptap/apply-block-format';
import {
  createChangeCaseTransaction,
  createCycledChangeCaseTransaction,
  isChangeCaseEnabled,
} from '../tiptap/apply-text-case';
import {
  documentModelV2ToolbarButtonSx,
  documentModelV2ToolbarControlColor,
  documentModelV2ToolbarIconButtonSx,
  documentModelV2ToolbarSelectSx,
} from 'components/organisms/tables/DocumentModelTable/document-model-presentation-theme';

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

function DocumentEditorV2ChangeCaseMenu({ editor }: { editor: Editor }) {
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const enabled = isChangeCaseEnabled(editor.state);

  const applyMode = (mode: TextCaseMode) => {
    const transaction = createChangeCaseTransaction(editor.state, mode);
    if (transaction) editor.view.dispatch(transaction);
    setAnchorEl(null);
  };

  return (
    <>
      <Button
        size="small"
        variant="outlined"
        color={documentModelV2ToolbarControlColor}
        disabled={!enabled}
        onClick={(event) => setAnchorEl(event.currentTarget)}
        aria-label="Alterar capitalização"
        aria-haspopup="true"
        aria-expanded={Boolean(anchorEl)}
        sx={[
          documentModelV2ToolbarButtonSx,
          { minWidth: 36, textTransform: 'none', fontWeight: 700 },
        ]}
      >
        Aa
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        {CHANGE_CASE_MENU_ITEMS.map((item) => (
          <MenuItem
            key={item.mode}
            dense
            onClick={() => applyMode(item.mode)}
          >
            <ListItemText
              primary={item.label}
              secondary={'shortcut' in item ? item.shortcut : undefined}
              primaryTypographyProps={{ fontSize: 13 }}
              secondaryTypographyProps={{ fontSize: 11 }}
            />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

function DocumentEditorV2ChangeCaseCycleButton({
  editor,
}: {
  editor: Editor;
}) {
  const enabled = isChangeCaseEnabled(editor.state);

  return (
    <Tooltip title={CHANGE_CASE_CYCLE_TOOLTIP}>
      <span>
        <IconButton
          size="small"
          color={documentModelV2ToolbarControlColor}
          disabled={!enabled}
          onClick={() => {
            const transaction = createCycledChangeCaseTransaction(editor.state);
            if (transaction) editor.view.dispatch(transaction);
          }}
          aria-label={CHANGE_CASE_CYCLE_TOOLTIP}
          sx={documentModelV2ToolbarIconButtonSx}
        >
          <SwapHorizIcon fontSize="small" />
        </IconButton>
      </span>
    </Tooltip>
  );
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
          renderValue={() => labelForActiveBlock(active)}
          onChange={(event) => {
            const next = String(event.target.value);
            if (!isBlockFormatType(next)) return;
            const transaction = createBlockFormatTransaction(
              editor.state,
              next as BlockFormatType,
            );
            if (transaction) editor.view.dispatch(transaction);
          }}
          sx={[documentModelV2ToolbarSelectSx, { fontSize: 13, height: 32 }]}
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
            color={documentModelV2ToolbarControlColor}
            disabled={bulletLevel <= BULLET_LEVEL_MIN}
            onClick={() => {
              const transaction = createBulletLevelTransaction(
                editor.state,
                bulletLevel - 1,
              );
              if (transaction) editor.view.dispatch(transaction);
            }}
            aria-label="Diminuir nível do marcador"
            sx={documentModelV2ToolbarIconButtonSx}
          >
            −
          </IconButton>
          <Typography
            variant="caption"
            sx={{ minWidth: 52, textAlign: 'center', color: 'text.secondary' }}
          >
            Nível {bulletLevel}
          </Typography>
          <IconButton
            size="small"
            color={documentModelV2ToolbarControlColor}
            disabled={bulletLevel >= BULLET_LEVEL_MAX}
            onClick={() => {
              const transaction = createBulletLevelTransaction(
                editor.state,
                bulletLevel + 1,
              );
              if (transaction) editor.view.dispatch(transaction);
            }}
            aria-label="Aumentar nível do marcador"
            sx={documentModelV2ToolbarIconButtonSx}
          >
            +
          </IconButton>
        </Stack>
      ) : null}
      <DocumentEditorV2TextFormatControls editor={editor} />
      <DocumentEditorV2ChangeCaseMenu editor={editor} />
      <DocumentEditorV2ChangeCaseCycleButton editor={editor} />
      <Button
        size="small"
        color={documentModelV2ToolbarControlColor}
        variant={editor.isActive('bold') ? 'contained' : 'outlined'}
        disabled={active.kind === 'atom'}
        onClick={() => editor.chain().focus().toggleBold().run()}
        sx={[documentModelV2ToolbarButtonSx, { minWidth: 36, fontWeight: 700 }]}
      >
        B
      </Button>
      <Button
        size="small"
        color={documentModelV2ToolbarControlColor}
        variant={editor.isActive('italic') ? 'contained' : 'outlined'}
        disabled={active.kind === 'atom'}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        sx={[documentModelV2ToolbarButtonSx, { minWidth: 36, fontStyle: 'italic' }]}
      >
        I
      </Button>
      <Button
        size="small"
        color={documentModelV2ToolbarControlColor}
        variant={editor.isActive('underline') ? 'contained' : 'outlined'}
        disabled={active.kind === 'atom'}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        sx={[
          documentModelV2ToolbarButtonSx,
          { minWidth: 36, textDecoration: 'underline' },
        ]}
      >
        U
      </Button>
      <Button
        size="small"
        color={documentModelV2ToolbarControlColor}
        variant={editor.isActive('link') ? 'contained' : 'outlined'}
        disabled={active.kind === 'atom'}
        onClick={() => promptExternalLink(editor)}
        sx={documentModelV2ToolbarButtonSx}
      >
        Link
      </Button>
    </Stack>
  );
}
