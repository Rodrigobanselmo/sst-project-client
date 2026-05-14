import { useCallback, useRef } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { Box, IconButton, Tooltip } from '@mui/material';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import { findFirstNestedKeyValue } from '@v2/utils/find-first-key-value';
import { SInputMultiline } from '../../fields/SInputMultiline/SInputMultiline';
import { SInputMultilineProps } from '../../fields/SInputMultiline/SInput.types';
import { getNestedError } from '../get-nested-error';

interface SInputMarkdownFormProps
  extends Omit<SInputMultilineProps, 'onChange' | 'value'> {
  name: string;
}

function wrapSelection(
  textarea: HTMLTextAreaElement,
  before: string,
  after: string,
  setValue: (name: string, value: string) => void,
  name: string,
) {
  const { selectionStart, selectionEnd, value } = textarea;
  const selected = value.slice(selectionStart, selectionEnd);

  const alreadyWrapped =
    value.slice(selectionStart - before.length, selectionStart) === before &&
    value.slice(selectionEnd, selectionEnd + after.length) === after;

  let next: string;
  let cursorStart: number;
  let cursorEnd: number;

  if (alreadyWrapped) {
    next =
      value.slice(0, selectionStart - before.length) +
      selected +
      value.slice(selectionEnd + after.length);
    cursorStart = selectionStart - before.length;
    cursorEnd = cursorStart + selected.length;
  } else {
    next =
      value.slice(0, selectionStart) +
      before +
      selected +
      after +
      value.slice(selectionEnd);
    cursorStart = selectionStart + before.length;
    cursorEnd = cursorStart + selected.length;
  }

  setValue(name, next);

  requestAnimationFrame(() => {
    textarea.focus();
    textarea.setSelectionRange(cursorStart, cursorEnd);
  });
}

function toggleBulletList(
  textarea: HTMLTextAreaElement,
  setValue: (name: string, value: string) => void,
  name: string,
) {
  const { selectionStart, selectionEnd, value } = textarea;

  const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
  const lineEnd =
    value.indexOf('\n', selectionEnd) === -1
      ? value.length
      : value.indexOf('\n', selectionEnd);
  const selectedLines = value.slice(lineStart, lineEnd);

  const lines = selectedLines.split('\n');
  const allBulleted = lines.every((l) => l.trimStart().startsWith('- '));

  const transformed = lines
    .map((l) => {
      if (allBulleted) return l.replace(/^(\s*)- /, '$1');
      return l.match(/^\s*- /) ? l : `- ${l}`;
    })
    .join('\n');

  const next = value.slice(0, lineStart) + transformed + value.slice(lineEnd);
  setValue(name, next);

  requestAnimationFrame(() => {
    textarea.focus();
    textarea.setSelectionRange(lineStart, lineStart + transformed.length);
  });
}

const toolbarSx = {
  display: 'flex',
  gap: '2px',
  borderBottom: '1px solid',
  borderColor: 'divider',
  backgroundColor: 'grey.50',
  borderRadius: '4px 4px 0 0',
  px: 1,
  py: 0.5,
};

const btnSx = { fontSize: 18 };

export function SInputMarkdownForm({
  name,
  ...props
}: SInputMarkdownFormProps) {
  const { setValue, formState, control } = useFormContext();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const error = getNestedError(formState?.errors, name);
  const errorMessage = error
    ? findFirstNestedKeyValue(error, 'message')
    : undefined;

  const value = useWatch({ name, control });

  const handleBold = useCallback(() => {
    if (!textareaRef.current) return;
    wrapSelection(textareaRef.current, '**', '**', setValue, name);
  }, [setValue, name]);

  const handleItalic = useCallback(() => {
    if (!textareaRef.current) return;
    wrapSelection(textareaRef.current, '_', '_', setValue, name);
  }, [setValue, name]);

  const handleBullet = useCallback(() => {
    if (!textareaRef.current) return;
    toggleBulletList(textareaRef.current, setValue, name);
  }, [setValue, name]);

  return (
    <Box>
      <Box sx={toolbarSx}>
        <Tooltip title="Negrito" arrow>
          <IconButton size="small" onClick={handleBold} tabIndex={-1}>
            <FormatBoldIcon sx={btnSx} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Itálico" arrow>
          <IconButton size="small" onClick={handleItalic} tabIndex={-1}>
            <FormatItalicIcon sx={btnSx} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Lista" arrow>
          <IconButton size="small" onClick={handleBullet} tabIndex={-1}>
            <FormatListBulletedIcon sx={btnSx} />
          </IconButton>
        </Tooltip>
      </Box>
      <SInputMultiline
        {...props}
        helperText={errorMessage}
        error={!!error}
        value={value ?? ''}
        onChange={(e) => setValue(name, e.target.value)}
        inputRef={textareaRef as any}
        sx={{
          ...props.sx,
          '& .MuiOutlinedInput-notchedOutline': {
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
          },
        }}
      />
    </Box>
  );
}
