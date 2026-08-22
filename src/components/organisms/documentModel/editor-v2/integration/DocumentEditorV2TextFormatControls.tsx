import React from 'react';

import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatAlignJustifyIcon from '@mui/icons-material/FormatAlignJustify';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
import FormatColorFillIcon from '@mui/icons-material/FormatColorFill';
import FormatColorTextIcon from '@mui/icons-material/FormatColorText';
import {
  Box,
  Button,
  FormControl,
  IconButton,
  Menu,
  MenuItem,
  Popover,
  Select,
  Stack,
  Tooltip,
} from '@mui/material';
import { Editor } from '@tiptap/react';
import { DocModelAlignmentType } from 'core/interfaces/api/IDocumentModel';

import {
  FONT_SIZE_OPTIONS,
  LINE_HEIGHT_OPTIONS,
  TEXT_ALIGN_OPTIONS,
  TEXT_COLOR_PRESETS,
  TextAlignValue,
} from '../domain/text-format';
import { InlineStyleTypeEnum } from 'project/enum/document-model.enum';

import {
  createBlockVisualTransaction,
  createColorTransaction,
  createInlineStyleTransaction,
  createLineHeightTransaction,
  createSizeTransaction,
  resolveTextFormatToolbarState,
} from '../tiptap/apply-text-format';

const ALIGN_ICONS = {
  [DocModelAlignmentType.START]: FormatAlignLeftIcon,
  [DocModelAlignmentType.CENTER]: FormatAlignCenterIcon,
  [DocModelAlignmentType.END]: FormatAlignRightIcon,
  [DocModelAlignmentType.BOTH]: FormatAlignJustifyIcon,
};

function ColorSwatches({
  selected,
  onPick,
  onReset,
  resetLabel,
}: {
  selected: string | null | 'mixed';
  onPick: (color: string) => void;
  onReset: () => void;
  resetLabel: string;
}) {
  return (
    <Stack spacing={1} sx={{ p: 1.25, width: 196 }}>
      <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
        {TEXT_COLOR_PRESETS.map((color) => (
          <Box
            key={color}
            component="button"
            type="button"
            onClick={() => onPick(color)}
            aria-label={`Cor ${color}`}
            sx={{
              width: 18,
              height: 18,
              p: 0,
              border:
                selected === color ? '2px solid #1976d2' : '1px solid #ccc',
              bgcolor: color,
              cursor: 'pointer',
            }}
          />
        ))}
      </Stack>
      <Button size="small" onClick={onReset}>
        {resetLabel}
      </Button>
    </Stack>
  );
}

export function DocumentEditorV2TextFormatControls({
  editor,
}: {
  editor: Editor;
}) {
  const ui = resolveTextFormatToolbarState(editor.state);
  const [alignEl, setAlignEl] = React.useState<HTMLElement | null>(null);
  const [colorEl, setColorEl] = React.useState<HTMLElement | null>(null);
  const [highlightEl, setHighlightEl] = React.useState<HTMLElement | null>(
    null,
  );

  const AlignIcon =
    ALIGN_ICONS[ui.align || DocModelAlignmentType.START] ||
    FormatAlignLeftIcon;

  const sizeValue = ui.hasSelection
    ? ui.inlineFontSize
    : ui.blockSize;
  const colorValue = ui.hasSelection ? ui.inlineColor : ui.blockColor;

  const applyAlign = (align: TextAlignValue) => {
    const transaction = createBlockVisualTransaction(editor.state, { align });
    if (transaction) editor.view.dispatch(transaction);
    setAlignEl(null);
  };

  const applySize = (size: number | null) => {
    const transaction = createSizeTransaction(editor.state, size);
    if (transaction) editor.view.dispatch(transaction);
  };

  const applyColor = (color: string | null) => {
    const transaction = createColorTransaction(editor.state, color);
    if (transaction) editor.view.dispatch(transaction);
    setColorEl(null);
  };

  const applyBg = (color: string | null) => {
    const transaction = createInlineStyleTransaction(
      editor.state,
      InlineStyleTypeEnum.BG_COLOR,
      color,
      color == null ? 'unset' : 'set',
    );
    if (transaction) editor.view.dispatch(transaction);
    setHighlightEl(null);
  };

  const applyLineHeight = (value: number | null) => {
    const transaction = createLineHeightTransaction(editor.state, value);
    if (transaction) editor.view.dispatch(transaction);
  };

  const lineHeightSelectValue =
    ui.lineHeight.kind === 'mixed'
      ? 'mixed'
      : ui.lineHeight.kind === 'value'
        ? String(ui.lineHeight.value)
        : 'default';

  return (
    <Stack direction="row" spacing={0.25} alignItems="center">
      <Tooltip title="Alinhamento">
        <span>
          <IconButton
            size="small"
            disabled={!ui.blockEnabled}
            onClick={(event) => setAlignEl(event.currentTarget)}
            aria-label="Alinhamento"
          >
            <AlignIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
      <Menu
        anchorEl={alignEl}
        open={Boolean(alignEl)}
        onClose={() => setAlignEl(null)}
      >
        {TEXT_ALIGN_OPTIONS.map((option) => {
          const Icon = ALIGN_ICONS[option.value];
          return (
            <MenuItem
              key={option.value}
              selected={ui.align === option.value}
              onClick={() => applyAlign(option.value)}
              dense
            >
              <Icon fontSize="small" style={{ marginRight: 8 }} />
              {option.label}
            </MenuItem>
          );
        })}
      </Menu>

      <FormControl size="small" sx={{ minWidth: 72 }}>
        <Select
          size="small"
          displayEmpty
          disabled={ui.atom || (ui.multi && !ui.hasSelection)}
          value={
            sizeValue === 'mixed'
              ? 'mixed'
              : sizeValue == null
                ? 'default'
                : String(sizeValue)
          }
          renderValue={() =>
            sizeValue === 'mixed'
              ? 'Misto'
              : sizeValue == null
                ? 'Tam.'
                : String(sizeValue)
          }
          onChange={(event) => {
            const raw = String(event.target.value);
            if (raw === 'mixed') return;
            applySize(raw === 'default' ? null : Number(raw));
          }}
          sx={{ fontSize: 12, height: 32 }}
        >
          <MenuItem value="default" dense>
            Padrão
          </MenuItem>
          {sizeValue === 'mixed' ? (
            <MenuItem value="mixed" dense disabled>
              Misto
            </MenuItem>
          ) : null}
          {FONT_SIZE_OPTIONS.map((size) => (
            <MenuItem key={size} value={String(size)} dense>
              {size}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Tooltip
        title={
          ui.hasSelection ? 'Cor do trecho' : 'Cor padrão do bloco'
        }
      >
        <span>
          <IconButton
            size="small"
            disabled={ui.atom || (ui.multi && !ui.hasSelection)}
            onClick={(event) => setColorEl(event.currentTarget)}
            aria-label="Cor do texto"
            sx={{
              color:
                colorValue && colorValue !== 'mixed' ? colorValue : 'inherit',
            }}
          >
            <FormatColorTextIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
      <Popover
        open={Boolean(colorEl)}
        anchorEl={colorEl}
        onClose={() => setColorEl(null)}
      >
        <ColorSwatches
          selected={colorValue}
          onPick={(color) => applyColor(color)}
          onReset={() => applyColor(null)}
          resetLabel="Padrão"
        />
      </Popover>

      <Tooltip title="Destaque (somente seleção)">
        <span>
          <IconButton
            size="small"
            disabled={!ui.inlineEnabled}
            onClick={(event) => setHighlightEl(event.currentTarget)}
            aria-label="Destaque"
          >
            <FormatColorFillIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
      <Popover
        open={Boolean(highlightEl)}
        anchorEl={highlightEl}
        onClose={() => setHighlightEl(null)}
      >
        <ColorSwatches
          selected={ui.highlight}
          onPick={(color) => applyBg(color)}
          onReset={() => applyBg(null)}
          resetLabel="Sem destaque"
        />
      </Popover>

      <FormControl size="small" sx={{ minWidth: 70 }}>
        <Select
          size="small"
          displayEmpty
          disabled={!ui.blockEnabled}
          value={lineHeightSelectValue}
          renderValue={() =>
            lineHeightSelectValue === 'mixed'
              ? 'Misto'
              : lineHeightSelectValue === 'default'
                ? 'Ln'
                : lineHeightSelectValue.replace('.', ',')
          }
          onChange={(event) => {
            const raw = String(event.target.value);
            if (raw === 'mixed') return;
            applyLineHeight(raw === 'default' ? null : Number(raw));
          }}
          sx={{ fontSize: 12, height: 32 }}
        >
          <MenuItem value="default" dense>
            1,46
          </MenuItem>
          {ui.lineHeight.kind === 'mixed' ? (
            <MenuItem value="mixed" dense disabled>
              Misto
            </MenuItem>
          ) : null}
          {LINE_HEIGHT_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={String(option.value)} dense>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Tooltip title="Sobrescrito">
        <span>
          <Button
            size="small"
            disabled={!ui.inlineEnabled}
            variant={ui.superscript === true ? 'contained' : 'outlined'}
            onClick={() => {
              const transaction = createInlineStyleTransaction(
                editor.state,
                InlineStyleTypeEnum.SUPERSCRIPT,
                null,
                'toggle',
              );
              if (transaction) editor.view.dispatch(transaction);
            }}
            sx={{ minWidth: 32, px: 0.5, fontSize: 12 }}
          >
            x²
          </Button>
        </span>
      </Tooltip>
      <Tooltip title="Subscrito">
        <span>
          <Button
            size="small"
            disabled={!ui.inlineEnabled}
            variant={ui.subscript === true ? 'contained' : 'outlined'}
            onClick={() => {
              const transaction = createInlineStyleTransaction(
                editor.state,
                InlineStyleTypeEnum.SUBSCRIPT,
                null,
                'toggle',
              );
              if (transaction) editor.view.dispatch(transaction);
            }}
            sx={{ minWidth: 32, px: 0.5, fontSize: 12 }}
          >
            x₂
          </Button>
        </span>
      </Tooltip>
    </Stack>
  );
}
