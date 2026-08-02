import { useLayoutEffect, useRef, useState } from 'react';

import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import {
  Box,
  Button,
  Chip,
  Link,
  Paper,
  Tooltip,
  Typography,
} from '@mui/material';

import { COCKPIT_FIELD_COLLAPSED_LINES } from './technical-content.util';

export type TechnicalContentEmptyVariant =
  | 'default'
  | 'summary-unavailable'
  | 'summary-pending';

type Props = {
  title: string;
  filled: boolean;
  /** Texto completo do campo (sem truncar no caller). */
  content: string;
  onEdit: () => void;
  onAi: () => void;
  aiLabel: string;
  aiDisabled?: boolean;
  aiDisabledTooltip?: string;
  editDisabled?: boolean;
  /** Estado vazio especializado (ex.: Resumo). */
  emptyVariant?: TechnicalContentEmptyVariant;
  /** Rótulo do chip de status (override). */
  statusLabel?: string;
  statusColor?: 'default' | 'success' | 'warning';
};

function EmptyState({ variant }: { variant: TechnicalContentEmptyVariant }) {
  if (variant === 'summary-unavailable') {
    return (
      <Box>
        <Typography fontSize={15} fontWeight={600} color="text.secondary">
          Resumo indisponível
        </Typography>
        <Typography
          fontSize={12.5}
          color="text.disabled"
          sx={{ mt: 0.75, lineHeight: 1.45 }}
        >
          O resumo poderá ser gerado após existir conteúdo em Descrição,
          Processos ou Considerações.
        </Typography>
      </Box>
    );
  }

  if (variant === 'summary-pending') {
    return (
      <Box>
        <Typography fontSize={15} fontWeight={600} color="text.secondary">
          Resumo ainda não gerado
        </Typography>
        <Typography
          fontSize={12.5}
          color="text.disabled"
          sx={{ mt: 0.75, lineHeight: 1.45 }}
        >
          Utilize IA para gerar a partir do conteúdo técnico ou Editar para
          preencher manualmente.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography fontSize={15} fontWeight={600} color="text.secondary">
        Nenhum conteúdo cadastrado
      </Typography>
      <Typography
        fontSize={12.5}
        color="text.disabled"
        sx={{ mt: 0.75, lineHeight: 1.45 }}
      >
        Utilize Editar para preencher manualmente ou IA para gerar um rascunho
        técnico.
      </Typography>
    </Box>
  );
}

/**
 * Cartão do cockpit: conteúdo em primeiro plano; ações secundárias;
 * expansão local independente (“Ver mais” / “Ver menos”).
 */
export function CharacterizationTechnicalContentFieldCard({
  title,
  filled,
  content,
  onEdit,
  onAi,
  aiLabel,
  aiDisabled = false,
  aiDisabledTooltip,
  editDisabled = false,
  emptyVariant = 'default',
  statusLabel,
  statusColor,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const [needsExpand, setNeedsExpand] = useState(false);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const hasContent = !!content.trim();

  useLayoutEffect(() => {
    setExpanded(false);
  }, [content]);

  useLayoutEffect(() => {
    if (!hasContent) {
      setNeedsExpand(false);
      return;
    }
    if (expanded) return;
    const el = contentRef.current;
    if (!el) return;
    setNeedsExpand(el.scrollHeight > el.clientHeight + 2);
  }, [content, expanded, hasContent]);

  const chipLabel =
    statusLabel || (filled ? 'Preenchido' : emptyVariant === 'summary-unavailable'
      ? 'Indisponível'
      : emptyVariant === 'summary-pending'
        ? 'Pendente'
        : 'Vazio');
  const chipColor =
    statusColor ||
    (filled
      ? 'success'
      : emptyVariant === 'summary-unavailable'
        ? 'warning'
        : 'default');

  return (
    <Paper
      variant="outlined"
      sx={{
        p: { xs: 2, sm: 2.5 },
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        minHeight: { xs: 200, sm: 240 },
        height: '100%',
        bgcolor: 'background.paper',
      }}
    >
      <Box
        display="flex"
        alignItems="flex-start"
        justifyContent="space-between"
        gap={1.5}
      >
        <Typography
          component="h3"
          fontWeight={700}
          fontSize={{ xs: 15, sm: 16 }}
          lineHeight={1.3}
          color="text.primary"
        >
          {title}
        </Typography>
        <Chip
          size="small"
          label={chipLabel}
          color={chipColor}
          variant={filled ? 'filled' : 'outlined'}
          sx={{
            height: 22,
            fontSize: 11,
            fontWeight: 600,
            flexShrink: 0,
            opacity: filled ? 1 : 0.85,
          }}
        />
      </Box>

      <Box sx={{ flex: 1, minHeight: 0 }}>
        {hasContent ? (
          <>
            <Typography
              ref={contentRef}
              component="div"
              fontSize={{ xs: 13.5, sm: 14 }}
              color="text.primary"
              sx={{
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                lineHeight: 1.55,
                ...(expanded
                  ? {}
                  : {
                      display: '-webkit-box',
                      WebkitLineClamp: COCKPIT_FIELD_COLLAPSED_LINES,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }),
              }}
            >
              {content}
            </Typography>
            {needsExpand || expanded ? (
              <Link
                component="button"
                type="button"
                underline="hover"
                onClick={() => setExpanded((v) => !v)}
                sx={{
                  mt: 0.75,
                  fontSize: 12.5,
                  fontWeight: 500,
                  color: 'text.secondary',
                  cursor: 'pointer',
                  border: 0,
                  background: 'none',
                  p: 0,
                }}
              >
                {expanded ? 'Ver menos' : 'Ver mais…'}
              </Link>
            ) : null}
          </>
        ) : (
          <EmptyState variant={emptyVariant} />
        )}
      </Box>

      <Box
        display="flex"
        gap={0.75}
        flexWrap="wrap"
        sx={{
          pt: 0.5,
          borderTop: '1px solid',
          borderColor: 'divider',
          mt: 'auto',
        }}
      >
        <Button
          size="small"
          variant="text"
          color="inherit"
          startIcon={<EditOutlinedIcon sx={{ fontSize: 16 }} />}
          onClick={onEdit}
          disabled={editDisabled}
          sx={{
            color: 'text.secondary',
            fontWeight: 500,
            textTransform: 'none',
            px: 1,
          }}
        >
          Editar
        </Button>
        <Tooltip title={aiDisabled ? aiDisabledTooltip || '' : aiLabel}>
          <span>
            <Button
              size="small"
              variant="text"
              color="inherit"
              startIcon={<AutoAwesomeOutlinedIcon sx={{ fontSize: 16 }} />}
              onClick={onAi}
              disabled={aiDisabled}
              sx={{
                color: aiDisabled ? undefined : 'text.secondary',
                fontWeight: 500,
                textTransform: 'none',
                px: 1,
              }}
            >
              IA
            </Button>
          </span>
        </Tooltip>
      </Box>
    </Paper>
  );
}
