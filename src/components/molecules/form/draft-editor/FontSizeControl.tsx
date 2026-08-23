import React, { FC, useRef, useState } from 'react';

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { Button, Menu, MenuItem } from '@mui/material';
import { EditorState, SelectionState } from 'draft-js';

import {
  DRAFT_FONT_SIZE_MENU_ATTR,
  FONT_SIZE_OPTIONS,
  getCurrentFontSize,
  resolveValidApplySelection,
  setSelectionFontSize,
} from './font-size.util';

type Props = {
  onChange: (editorState: EditorState) => void;
  editorState: EditorState;
};

export const FontSizeControl: FC<Props> = ({ onChange, editorState }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const capturedRef = useRef<SelectionState | null>(null);

  const current = getCurrentFontSize(editorState);
  const label = current == null ? '—' : String(current);
  const open = Boolean(anchorEl);

  const captureLiveRange = () => {
    const live = editorState.getSelection();
    if (
      !live.isCollapsed() &&
      resolveValidApplySelection(
        editorState.getCurrentContent(),
        live,
        null,
      )
    ) {
      capturedRef.current = live;
    }
  };

  const preserveDraftFocus = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    captureLiveRange();
  };

  const applySize = (size: number) => {
    const target = resolveValidApplySelection(
      editorState.getCurrentContent(),
      editorState.getSelection(),
      capturedRef.current,
    );
    setAnchorEl(null);
    if (!target) return;
    onChange(setSelectionFontSize(editorState, size, target));
  };

  return (
    <div className="draft-font-size-control" title="Tamanho da fonte">
      <Button
        size="small"
        variant="text"
        disableRipple
        disableElevation
        aria-label="Tamanho da fonte"
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onMouseDown={preserveDraftFocus}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          captureLiveRange();
          setAnchorEl(e.currentTarget);
        }}
      >
        {label}
        <KeyboardArrowDownIcon sx={{ fontSize: 14, ml: 0.25 }} />
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        disableAutoFocus
        disableEnforceFocus
        disableRestoreFocus
        disableScrollLock
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        MenuListProps={{
          dense: true,
          autoFocusItem: false,
          onMouseDown: (e) => {
            e.preventDefault();
            e.stopPropagation();
          },
        }}
        PaperProps={{
          className: 'draft-font-size-menu',
          [DRAFT_FONT_SIZE_MENU_ATTR]: '',
          onMouseDown: (e) => {
            e.preventDefault();
            e.stopPropagation();
          },
        }}
        sx={{ zIndex: (theme) => theme.zIndex.modal + 2 }}
      >
        {FONT_SIZE_OPTIONS.map((option) => (
          <MenuItem
            key={option}
            selected={current === option}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onClick={() => applySize(option)}
          >
            {option}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
};
