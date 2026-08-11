import { Box, type BoxProps } from '@mui/material';
import { SText } from '@v2/components/atoms/SText/SText';
import type { ReactNode } from 'react';

type Props = {
  title: string;
  children: ReactNode;
  /** Optional helper under the title */
  subtitle?: string;
  /** Visual tone for the section container */
  tone?: 'planilha' | 'identidade' | 'catalogo' | 'decisao';
} & Omit<BoxProps, 'title' | 'children'>;

const TONE_SX: Record<
  NonNullable<Props['tone']>,
  { bgcolor: string; borderColor: string }
> = {
  planilha: { bgcolor: 'grey.50', borderColor: 'grey.300' },
  identidade: { bgcolor: 'background.paper', borderColor: 'info.light' },
  catalogo: { bgcolor: 'background.paper', borderColor: 'secondary.light' },
  decisao: { bgcolor: 'action.hover', borderColor: 'grey.400' },
};

/**
 * Visual-only section wrapper for Excel AI curation cards.
 * Does not change curation / identity / decision rules.
 */
export function ChemicalCurationSectionBox({
  title,
  subtitle,
  children,
  tone = 'planilha',
  sx,
  ...boxProps
}: Props) {
  const toneSx = TONE_SX[tone];
  return (
    <Box
      {...boxProps}
      sx={{
        p: 1.5,
        borderRadius: 1,
        border: '1px solid',
        borderColor: toneSx.borderColor,
        bgcolor: toneSx.bgcolor,
        ...((sx as object) || {}),
      }}
    >
      <SText fontSize={11} fontWeight={700} letterSpacing={0.4} mb={subtitle ? 0.25 : 1}>
        {title}
      </SText>
      {subtitle ? (
        <SText fontSize={11} color="text.secondary" mb={1}>
          {subtitle}
        </SText>
      ) : null}
      {children}
    </Box>
  );
}
