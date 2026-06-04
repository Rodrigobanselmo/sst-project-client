import { ReactNode } from 'react';
import { Stack, Typography } from '@mui/material';
import {
  siteBodyLargeSx,
  siteEyebrowSx,
  siteLeadSx,
  siteSectionHeaderMb,
  siteSectionSubtitleSx,
  siteSectionTitleSx,
} from '../styles/site.styles';

type SiteSectionHeaderProps = {
  eyebrow?: string;
  title: ReactNode;
  /** Frase curta abaixo do título — hierarquia entre título e texto explicativo */
  lead?: string;
  subtitle?: string;
  align?: 'left' | 'center';
  maxWidth?: number;
  /** Largura do subtítulo (centralizado) — pode ser maior que o título */
  subtitleMaxWidth?: number;
  dense?: boolean;
};

export function SiteSectionHeader({
  eyebrow,
  title,
  lead,
  subtitle,
  align = 'left',
  maxWidth = 640,
  subtitleMaxWidth,
  dense = false,
}: SiteSectionHeaderProps) {
  const textMaxWidth = align === 'center' ? maxWidth : lead ? 560 : 560;
  const centeredHeaderWidth =
    align === 'center' ? Math.max(maxWidth, subtitleMaxWidth ?? maxWidth) : undefined;
  const resolvedSubtitleMaxWidth =
    align === 'center' ? (subtitleMaxWidth ?? textMaxWidth) : textMaxWidth;

  return (
    <Stack
      spacing={lead ? 1.25 : dense ? 1.5 : 2}
      sx={dense ? { mb: { xs: 4, md: 5 } } : siteSectionHeaderMb}
      alignItems={align === 'center' ? 'center' : 'flex-start'}
      textAlign={align}
      maxWidth={centeredHeaderWidth}
      mx={align === 'center' ? 'auto' : 0}
      width="100%"
    >
      {eyebrow ? (
        <Typography component="span" sx={siteEyebrowSx}>
          {eyebrow}
        </Typography>
      ) : null}
      <Typography
        component="h2"
        sx={{
          ...siteSectionTitleSx,
          ...(align === 'center'
            ? { maxWidth, width: '100%', mx: 'auto' }
            : {}),
        }}
      >
        {title}
      </Typography>
      {lead ? (
        <Typography sx={{ ...siteLeadSx, maxWidth: textMaxWidth }}>{lead}</Typography>
      ) : null}
      {subtitle ? (
        <Typography
          sx={{
            ...(lead ? siteBodyLargeSx : siteSectionSubtitleSx),
            maxWidth: resolvedSubtitleMaxWidth,
            mt: lead ? 0.75 : 0,
          }}
        >
          {subtitle}
        </Typography>
      ) : null}
    </Stack>
  );
}
