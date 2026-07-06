import { FC } from 'react';

import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import {
  Chip,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

import {
  EXAM_RISK_AI_DECISION_COLORS,
  EXAM_RISK_AI_DECISION_LABELS,
} from './exam-risk-ai-assistant.constants';

const ACCUMULATED_LIST_MAX_HEIGHT = 280;

export type ExamRiskAiAccumulatedRow = {
  key: string;
  riskLabel?: string;
  examLabel: string;
  decision: string;
  confidence?: number;
  alreadyCreated?: boolean;
};

type Props = {
  title: string;
  rows: ExamRiskAiAccumulatedRow[];
  onRemove: (key: string) => void;
  emptyHint?: string;
};

export const ExamRiskAiAccumulatedSelectionPanel: FC<Props> = ({
  title,
  rows,
  onRemove,
  emptyHint,
}) => {
  if (!rows.length) {
    if (!emptyHint) return null;
    return (
      <Typography variant="body2" color="text.secondary">
        {emptyHint}
      </Typography>
    );
  }

  const hasScroll = rows.length > 4;

  return (
    <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ px: 2, py: 1.5, bgcolor: 'grey.50', borderBottom: 1, borderColor: 'divider' }}
      >
        <Typography variant="subtitle2">{title}</Typography>
        <Chip size="small" label={`${rows.length} item(ns)`} variant="outlined" />
      </Stack>
      <TableContainer
        sx={{
          ...(hasScroll && {
            maxHeight: ACCUMULATED_LIST_MAX_HEIGHT,
            overflowY: 'auto',
          }),
        }}
      >
        <Table size="small" stickyHeader={hasScroll}>
          <TableHead>
            <TableRow>
              {rows.some((row) => row.riskLabel) && (
                <TableCell>Risco</TableCell>
              )}
              <TableCell>Exame</TableCell>
              <TableCell>Decisão</TableCell>
              <TableCell width={90}>Confiança</TableCell>
              <TableCell width={56} align="right">
                Remover
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => {
              const decisionLabel =
                EXAM_RISK_AI_DECISION_LABELS[
                  row.decision as keyof typeof EXAM_RISK_AI_DECISION_LABELS
                ] ?? row.decision;
              const decisionColor =
                EXAM_RISK_AI_DECISION_COLORS[
                  row.decision as keyof typeof EXAM_RISK_AI_DECISION_COLORS
                ] ?? 'default';

              return (
                <TableRow key={row.key} hover>
                  {rows.some((item) => item.riskLabel) && (
                    <TableCell>{row.riskLabel ?? '—'}</TableCell>
                  )}
                  <TableCell>
                    <Typography variant="body2">{row.examLabel}</Typography>
                    {row.alreadyCreated && (
                      <Chip
                        size="small"
                        color="success"
                        label="Rascunho criado"
                        sx={{ mt: 0.5 }}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={decisionLabel}
                      color={decisionColor}
                      variant={row.decision === 'exclude' ? 'outlined' : 'filled'}
                    />
                  </TableCell>
                  <TableCell>
                    {row.confidence != null
                      ? `${Math.round(row.confidence * 100)}%`
                      : '—'}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      aria-label="Remover da lista"
                      onClick={() => onRemove(row.key)}
                      disabled={row.alreadyCreated}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};
