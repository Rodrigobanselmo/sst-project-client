import React from 'react';
import { BoxProps } from '@mui/material';
import { STSelectBox } from '../RenderCard/components/NodeCard/styles';
import { REVIEW_COLORS } from './gse-integrated-review.model';

/** Same circular primitive in the legend and on the actual tree cards. */
export function GseLinkSymbol({
  kind,
  inherited = false,
  children,
  sx,
  ...props
}: BoxProps & {
  kind: 'existing' | 'add' | 'remove' | 'neutral';
  inherited?: boolean;
}) {
  const tone = REVIEW_COLORS[kind];
  return (
    <STSelectBox
      {...props}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        color: tone.color,
        bgcolor: inherited ? 'transparent' : tone.background,
        border: `2px ${inherited ? 'dashed' : 'solid'} ${tone.color}`,
        width: 21,
        height: 21,
        minWidth: 21,
        maxWidth: 21,
        minHeight: 21,
        maxHeight: 21,
        fontSize: 14,
        fontWeight: 900,
        m: 0,
        position: 'relative',
        ...sx,
      }}
    >
      {children ?? (inherited ? '↑' : kind === 'remove' ? '−' : '●')}
    </STSelectBox>
  );
}
