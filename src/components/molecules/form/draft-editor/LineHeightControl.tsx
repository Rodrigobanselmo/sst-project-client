import React, { FC, useMemo } from 'react';

import { EditorState } from 'draft-js';

import {
  DEFAULT_LINE_HEIGHT,
  getCurrentLineHeight,
  LINE_HEIGHT_OPTIONS,
  setLineHeightOnBlocks,
} from './line-height.util';

type Props = {
  onChange: (editorState: EditorState) => void;
  editorState: EditorState;
};

export const LineHeightControl: FC<Props> = ({ onChange, editorState }) => {
  const current = getCurrentLineHeight(editorState);

  const selectValue = useMemo(() => {
    if (current == null) return String(DEFAULT_LINE_HEIGHT);
    return String(current);
  }, [current]);

  const stopToolbarCapture = (e: React.SyntheticEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="draft-line-height-control" title="Espaçamento entre linhas">
      <span className="draft-line-height-label">Ln</span>
      <select
        aria-label="Espaçamento entre linhas"
        value={selectValue}
        onMouseDown={stopToolbarCapture}
        onClick={stopToolbarCapture}
        onChange={(e) => {
          const raw = e.target.value;
          const lineHeight =
            raw === String(DEFAULT_LINE_HEIGHT)
              ? undefined
              : Number(raw);
          onChange(setLineHeightOnBlocks(editorState, lineHeight));
        }}
      >
        <option value={String(DEFAULT_LINE_HEIGHT)}>1,46</option>
        {LINE_HEIGHT_OPTIONS.map((opt) => (
          <option key={opt.value} value={String(opt.value)}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};
