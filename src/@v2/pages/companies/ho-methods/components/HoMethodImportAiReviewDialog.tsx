import { FC, useEffect, useMemo, useState } from 'react';

import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

import type { HoMethodAiReviewResult } from '@v2/services/occupational-hygiene/ho-method/service/ho-method.types';
import type { HoMethodImportParseResult } from '@v2/services/occupational-hygiene/ho-method/service/ho-method.types';

import { applyHoMethodAiReviewSelection } from '../utils/ho-method-import-ai-review-apply.util';
import {
  buildHoMethodAiReviewDiffRows,
  getHoMethodAiReviewWarnings,
  type HoMethodAiReviewDiffRow,
} from '../utils/ho-method-import-ai-review-diff.util';

type Props = {
  open: boolean;
  parserResult: HoMethodImportParseResult | null;
  aiResult: HoMethodAiReviewResult | null;
  onClose: () => void;
  onApplied: (updated: HoMethodImportParseResult) => void;
};

const statusLabel = (status: HoMethodAiReviewDiffRow['status']) => {
  if (status === 'new') return 'Novo';
  if (status === 'different') return 'Diferente';
  return 'Igual';
};

const statusColor = (status: HoMethodAiReviewDiffRow['status']) => {
  if (status === 'new') return 'success';
  if (status === 'different') return 'warning';
  return 'default';
};

export const HoMethodImportAiReviewDialog: FC<Props> = ({
  open,
  parserResult,
  aiResult,
  onClose,
  onApplied,
}) => {
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  const rows = useMemo(
    () =>
      parserResult && aiResult
        ? buildHoMethodAiReviewDiffRows({ parserResult, aiResult })
        : [],
    [parserResult, aiResult],
  );

  const warnings = useMemo(
    () => (aiResult ? getHoMethodAiReviewWarnings(aiResult) : []),
    [aiResult],
  );

  useEffect(() => {
    if (!open) return;
    setSelectedKeys(
      rows.filter((row) => row.selectedByDefault).map((row) => row.key),
    );
  }, [open, rows]);

  const toggleKey = (key: string) => {
    setSelectedKeys((current) =>
      current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key],
    );
  };

  const handleApply = (keys: string[]) => {
    if (!parserResult || !aiResult || !keys.length) return;
    onApplied(
      applyHoMethodAiReviewSelection({
        parserResult,
        aiResult,
        selectedKeys: keys,
      }),
    );
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Revisar análise assistida por IA</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Compare o resultado do parser determinístico com a proposta da IA. Nada
          será salvo automaticamente — selecione o que deseja aplicar na prévia.
        </Typography>

        {warnings.map((warning) => (
          <Alert key={warning} severity="warning" sx={{ mt: 2 }}>
            {warning}
          </Alert>
        ))}

        {aiResult?.diagnostics.detectedTables?.length ? (
          <Box mt={2}>
            <Typography variant="subtitle2" gutterBottom>
              Tabelas detectadas
            </Typography>
            {aiResult.diagnostics.detectedTables.map((table, index) => (
              <Chip
                key={`${table.title ?? table.label ?? 'table'}-${index}`}
                size="small"
                label={`${table.title || table.label || 'Tabela'} · ${table.inferredPurpose} · ${table.confidence}`}
                sx={{ mr: 1, mb: 1 }}
              />
            ))}
          </Box>
        ) : null}

        {!rows.length ? (
          <Alert severity="info" sx={{ mt: 2 }}>
            A IA não encontrou diferenças relevantes em relação ao parser atual.
          </Alert>
        ) : (
          <Table size="small" sx={{ mt: 2 }}>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox" />
                <TableCell>Campo</TableCell>
                <TableCell>Parser atual</TableCell>
                <TableCell>Sugestão IA</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.key}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedKeys.includes(row.key)}
                      onChange={() => toggleKey(row.key)}
                    />
                  </TableCell>
                  <TableCell>{row.label}</TableCell>
                  <TableCell>{row.parserValue || '—'}</TableCell>
                  <TableCell>{row.aiValue || '—'}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={statusLabel(row.status)}
                      color={statusColor(row.status)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {aiResult?.agents?.length ? (
          <Box mt={3}>
            <Typography variant="subtitle2" gutterBottom>
              Agentes sugeridos pela IA
            </Typography>
            {aiResult.agents.map((agent) => (
              <Box key={`${agent.name}-${agent.cas ?? 'no-cas'}`} mb={1}>
                <Typography variant="body2">
                  {agent.name}
                  {agent.cas ? ` · CAS ${agent.cas}` : ''}
                  {agent.translatedNamePtBr ? ` · ${agent.translatedNamePtBr}` : ''}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Confiança: {agent.confidence}
                  {agent.matchedRiskFactor
                    ? ` · Match: ${agent.matchedRiskFactor.name}`
                    : ''}
                  {agent.warnings?.length ? ` · ${agent.warnings.join(' | ')}` : ''}
                </Typography>
                {agent.sourceTrace?.length ? (
                  <Typography variant="caption" display="block" color="text.secondary">
                    Fonte:{' '}
                    {agent.sourceTrace
                      .map(
                        (trace) =>
                          `${trace.table || 'doc'}${trace.page ? ` p.${trace.page}` : ''}: ${trace.excerpt}`,
                      )
                      .join(' | ')}
                  </Typography>
                ) : null}
              </Box>
            ))}
          </Box>
        ) : null}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Ignorar</Button>
        <Button
          onClick={() => handleApply(rows.map((row) => row.key))}
          disabled={!rows.length}
        >
          Aplicar tudo
        </Button>
        <Button
          variant="contained"
          onClick={() => handleApply(selectedKeys)}
          disabled={!selectedKeys.length}
        >
          Aplicar selecionados
        </Button>
      </DialogActions>
    </Dialog>
  );
};
