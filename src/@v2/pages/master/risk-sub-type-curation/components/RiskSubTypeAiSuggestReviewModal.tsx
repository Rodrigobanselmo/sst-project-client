import { FC, useEffect, useMemo, useState } from 'react';

import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import type { ISuggestRiskSubtypeCandidatesResponse } from '@v2/services/security/risk/sub-type/risk-subtype-curation/risk-subtype-curation.types';

import {
  buildChemicalIdentityTooltip,
  ENRICHMENT_PARTIAL_WARNING,
  getCandidateDecisionDisplay,
  getVisibleCandidateWarnings,
  hasExternalChemicalIdentity,
  isLowConfidenceCandidate,
  matchesCandidateModalFilters,
} from '../utils/risk-subtype-curation-ai-display.utils';

type Props = {
  open: boolean;
  loading?: boolean;
  error?: string | null;
  data: ISuggestRiskSubtypeCandidatesResponse | null;
  subTypeName?: string;
  onClose: () => void;
  onApplySelected: (riskFactorIds: string[]) => void;
  applying?: boolean;
  onRefineSearch?: () => void;
};

export const RiskSubTypeAiSuggestReviewModal: FC<Props> = ({
  open,
  loading,
  error,
  data,
  subTypeName,
  onClose,
  onApplySelected,
  applying,
  onRefineSearch,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showSuggestedInclude, setShowSuggestedInclude] = useState(true);
  const [showExcluded, setShowExcluded] = useState(true);
  const [showLowConfidence, setShowLowConfidence] = useState(false);
  const [filterSearch, setFilterSearch] = useState('');

  const initializedFor = data?.generatedAt ?? null;

  useEffect(() => {
    if (!data) {
      setSelectedIds([]);
      return;
    }
    setSelectedIds(
      data.candidates
        .filter((candidate) => candidate.defaultSelected)
        .map((candidate) => candidate.riskFactorId),
    );
    setShowSuggestedInclude(true);
    setShowExcluded(true);
    setShowLowConfidence(false);
    setFilterSearch('');
  }, [initializedFor, data]);

  const hiddenLowCount = useMemo(() => {
    if (!data || showLowConfidence) return 0;
    return data.candidates.filter(isLowConfidenceCandidate).length;
  }, [data, showLowConfidence]);

  const filteredCandidates = useMemo(() => {
    if (!data) return [];
    return data.candidates.filter((candidate) =>
      matchesCandidateModalFilters(candidate, {
        showSuggestedInclude,
        showExcluded,
        showLowConfidence,
        search: filterSearch,
      }),
    );
  }, [
    data,
    filterSearch,
    showExcluded,
    showLowConfidence,
    showSuggestedInclude,
  ]);

  const toggleOne = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id],
    );
  };

  const toggleAllVisible = () => {
    const visibleIds = filteredCandidates.map((c) => c.riskFactorId);
    const allVisibleSelected =
      visibleIds.length > 0 &&
      visibleIds.every((id) => selectedIds.includes(id));
    if (allVisibleSelected) {
      setSelectedIds((current) =>
        current.filter((id) => !visibleIds.includes(id)),
      );
      return;
    }
    setSelectedIds((current) => [...new Set([...current, ...visibleIds])]);
  };

  const allVisibleSelected =
    filteredCandidates.length > 0 &&
    filteredCandidates.every((c) => selectedIds.includes(c.riskFactorId));

  const scopeDescription = useMemo(() => {
    if (!data) return '';
    const parts = [
      `A IA analisou até ${data.scope.maxCandidates ?? data.scope.analyzed} dos ${data.scope.eligibleTotal} riscos químicos elegíveis (sem subtipo, catálogo global)`,
      data.scope.onlyPcmso ? 'somente PCMSO' : 'incluindo não-PCMSO',
    ];
    if (data.scope.search) {
      parts.push(`com busca “${data.scope.search}”`);
    } else {
      parts.push('na ordem retornada pelo backend — não necessariamente a página visível da tabela');
    }
    return `${parts.join(', ')}.`;
  }, [data]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Revisão de candidatos sugeridos por IA</DialogTitle>
      <DialogContent>
        <Alert severity="info" sx={{ mb: 2 }}>
          Sugestões de IA exigem revisão técnica. Nada é salvo automaticamente.
          A confiança indica o grau de certeza da IA na decisão de incluir ou
          excluir — não é severidade toxicológica.
        </Alert>

        {loading && (
          <Box display="flex" alignItems="center" gap={2} py={4}>
            <CircularProgress size={28} />
            <Typography>
              Analisando riscos químicos sem subtipo
              {subTypeName ? ` para “${subTypeName}”` : ''}…
            </Typography>
          </Box>
        )}

        {error && !loading && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {data && !loading && (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {scopeDescription}
            </Typography>

            <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
              <Chip label={`Analisados: ${data.scope.analyzed}`} size="small" />
              <Chip
                label={`Sugeridos p/ incluir: ${data.summary.includedWithConfidence ?? data.summary.suggestedInclude}`}
                size="small"
                color="primary"
              />
              <Chip
                label={`Excluídos c/ confiança: ${data.summary.excludedWithConfidence ?? 0}`}
                size="small"
              />
              <Chip
                label={`Baixa confiança: ${data.summary.lowConfidence}`}
                size="small"
              />
              {data.scope.truncated && (
                <Chip
                  label={`Truncado (${data.scope.eligibleTotal} elegíveis)`}
                  size="small"
                  color="warning"
                />
              )}
            </Box>

            {data.warnings.map((warning) => (
              <Alert
                key={warning}
                severity={
                  warning.includes(ENRICHMENT_PARTIAL_WARNING) ? 'info' : 'warning'
                }
                sx={{ mb: 1 }}
              >
                {warning}
              </Alert>
            ))}

            {data.enrichment && data.enrichment.failed > 0 && (
              <Alert severity="info" sx={{ mb: 2 }}>
                {data.enrichment.failed} de {data.enrichment.attempted} risco(s)
                analisado(s) sem enriquecimento externo (PubChem).
              </Alert>
            )}

            {hiddenLowCount > 0 && (
              <Alert severity="info" sx={{ mb: 2 }}>
                {hiddenLowCount} item(ns) de baixa confiança estão ocultos. Ative
                &quot;Mostrar baixa confiança&quot; para revisar.
              </Alert>
            )}

            <Typography variant="caption" color="text.secondary" display="block" mb={1}>
              Exibindo {filteredCandidates.length} de {data.scope.analyzed} analisados
              nesta execução.
            </Typography>

            <Box display="flex" flexWrap="wrap" gap={2} mb={2} alignItems="center">
              <TextField
                size="small"
                placeholder="Buscar nesta revisão (nome, CAS, eSocial)..."
                value={filterSearch}
                onChange={(e) => setFilterSearch(e.target.value)}
                sx={{ minWidth: 260 }}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={showSuggestedInclude}
                    onChange={(e) => setShowSuggestedInclude(e.target.checked)}
                  />
                }
                label="Mostrar sugeridos p/ incluir"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={showExcluded}
                    onChange={(e) => setShowExcluded(e.target.checked)}
                  />
                }
                label="Mostrar excluídos"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={showLowConfidence}
                    onChange={(e) => setShowLowConfidence(e.target.checked)}
                  />
                }
                label="Mostrar baixa confiança"
              />
              {onRefineSearch && (
                <Button size="small" variant="text" onClick={onRefineSearch}>
                  Refinar busca na lista e analisar outro recorte
                </Button>
              )}
            </Box>

            <Box sx={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: 8 }}>
                      <Checkbox
                        checked={allVisibleSelected}
                        onChange={toggleAllVisible}
                      />
                    </th>
                    <th style={{ textAlign: 'left', padding: 8 }}>Nome</th>
                    <th style={{ textAlign: 'left', padding: 8 }}>CAS</th>
                    <th style={{ textAlign: 'left', padding: 8 }}>eSocial</th>
                    <th style={{ textAlign: 'left', padding: 8 }}>
                      <Tooltip title="Confiança da IA na decisão de incluir ou excluir">
                        <span>Decisão (confiança)</span>
                      </Tooltip>
                    </th>
                    <th style={{ textAlign: 'left', padding: 8 }}>Justificativa</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCandidates.map((candidate) => {
                    const decision = getCandidateDecisionDisplay(candidate);
                    const visibleWarnings = getVisibleCandidateWarnings(
                      candidate.warnings,
                    );
                    const isReview = decision.tone === 'review';

                    return (
                      <tr
                        key={candidate.riskFactorId}
                        style={isReview ? { opacity: 0.75 } : undefined}
                      >
                        <td style={{ padding: 8, verticalAlign: 'top' }}>
                          <Checkbox
                            checked={selectedIds.includes(candidate.riskFactorId)}
                            onChange={() => toggleOne(candidate.riskFactorId)}
                          />
                        </td>
                      <td style={{ padding: 8, verticalAlign: 'top' }}>
                        <Box display="flex" alignItems="center" gap={0.5} flexWrap="wrap">
                          <span>{candidate.name}</span>
                          {hasExternalChemicalIdentity(candidate) && (
                            <Tooltip
                              title={buildChemicalIdentityTooltip(
                                candidate.chemicalIdentity!,
                              )}
                            >
                              <Chip
                                size="small"
                                label="PubChem"
                                variant="outlined"
                                sx={{ height: 20, fontSize: 11 }}
                              />
                            </Tooltip>
                          )}
                        </Box>
                      </td>
                        <td style={{ padding: 8, verticalAlign: 'top' }}>
                          {candidate.cas ?? '—'}
                        </td>
                        <td style={{ padding: 8, verticalAlign: 'top' }}>
                          {candidate.esocialCode ?? '—'}
                        </td>
                        <td style={{ padding: 8, verticalAlign: 'top' }}>
                          <Chip
                            size="small"
                            label={decision.label}
                            color={decision.chipColor}
                            variant={decision.tone === 'exclude' ? 'outlined' : 'filled'}
                          />
                          <Typography
                            variant="caption"
                            display="block"
                            color="text.secondary"
                            mt={0.5}
                          >
                            {decision.detail}
                          </Typography>
                        </td>
                        <td style={{ padding: 8, verticalAlign: 'top' }}>
                          <Typography
                            variant="body2"
                            color={isReview ? 'text.secondary' : 'text.primary'}
                          >
                            {candidate.rationale}
                          </Typography>
                          {visibleWarnings.map((warning) => (
                            <Typography
                              key={warning}
                              variant="caption"
                              color="warning.main"
                              display="block"
                            >
                              {warning}
                            </Typography>
                          ))}
                        </td>
                      </tr>
                    );
                  })}
                  {!filteredCandidates.length && (
                    <tr>
                      <td colSpan={6} style={{ padding: 12 }}>
                        Nenhum candidato para os filtros atuais.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </Box>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fechar</Button>
        <Button
          variant="contained"
          disabled={!selectedIds.length || applying || loading}
          onClick={() => onApplySelected(selectedIds)}
        >
          Aplicar selecionados ({selectedIds.length})
        </Button>
      </DialogActions>
    </Dialog>
  );
};
