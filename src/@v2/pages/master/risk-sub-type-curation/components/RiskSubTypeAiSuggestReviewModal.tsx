import { FC, useEffect, useMemo, useRef, useState } from 'react';

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
import {
  formatSuggestBatchLabel,
  getDefaultSelectedCandidateIds,
} from '../utils/risk-subtype-curation-ai.utils';

type LoadingScope = {
  page: number;
  limit: number;
  eligibleTotal?: number;
  rangeStart?: number;
  rangeEnd?: number;
};

type Props = {
  open: boolean;
  loading?: boolean;
  loadingNextBatch?: boolean;
  loadingScope?: LoadingScope;
  error?: string | null;
  data: ISuggestRiskSubtypeCandidatesResponse | null;
  subTypeName?: string;
  onClose: () => void;
  onApplySelected: (riskFactorIds: string[]) => void;
  applying?: boolean;
  onRefineSearch?: () => void;
  onLoadNextBatch?: () => void;
};

export const RiskSubTypeAiSuggestReviewModal: FC<Props> = ({
  open,
  loading,
  loadingNextBatch,
  loadingScope,
  error,
  data,
  subTypeName,
  onClose,
  onApplySelected,
  applying,
  onRefineSearch,
  onLoadNextBatch,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showSuggestedInclude, setShowSuggestedInclude] = useState(true);
  const [showExcluded, setShowExcluded] = useState(true);
  const [showLowConfidence, setShowLowConfidence] = useState(false);
  const [filterSearch, setFilterSearch] = useState('');
  const initializedSessionRef = useRef<string | null>(null);
  const knownCandidateIdsRef = useRef<Set<string>>(new Set());

  const sessionKey = data
    ? `${data.targetSubType.id}:${data.scope.search ?? ''}:${data.scope.onlyPcmso}`
    : null;

  useEffect(() => {
    if (!data) {
      setSelectedIds([]);
      initializedSessionRef.current = null;
      knownCandidateIdsRef.current = new Set();
      return;
    }

    const isNewSession = initializedSessionRef.current !== sessionKey;
    if (isNewSession) {
      setSelectedIds(getDefaultSelectedCandidateIds(data.candidates));
      setShowSuggestedInclude(true);
      setShowExcluded(true);
      setShowLowConfidence(false);
      setFilterSearch('');
      initializedSessionRef.current = sessionKey;
      knownCandidateIdsRef.current = new Set(
        data.candidates.map((candidate) => candidate.riskFactorId),
      );
      return;
    }

    const freshCandidates = data.candidates.filter(
      (candidate) => !knownCandidateIdsRef.current.has(candidate.riskFactorId),
    );
    if (freshCandidates.length) {
      const freshDefaults = getDefaultSelectedCandidateIds(freshCandidates);
      if (freshDefaults.length) {
        setSelectedIds((current) => [...new Set([...current, ...freshDefaults])]);
      }
      for (const candidate of freshCandidates) {
        knownCandidateIdsRef.current.add(candidate.riskFactorId);
      }
    }
  }, [data, sessionKey]);

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

  const cumulativeAnalyzed =
    data?.scope.cumulativeAnalyzed ?? data?.scope.analyzed ?? 0;
  const batchesLoaded = data?.scope.batchesLoaded ?? 1;

  const scopeDescription = useMemo(() => {
    if (!data) return '';
    const parts = [
      `A IA analisa lotes de até ${data.scope.limit} dos ${data.scope.eligibleTotal} riscos químicos elegíveis (sem subtipo, catálogo global)`,
      data.scope.onlyPcmso ? 'somente PCMSO' : 'incluindo não-PCMSO',
    ];
    if (data.scope.search) {
      parts.push(`com busca “${data.scope.search}”`);
    } else {
      parts.push('na ordem retornada pelo backend — não necessariamente a página visível da tabela');
    }
    return `${parts.join(', ')}.`;
  }, [data]);

  const isProcessingBatch = loading || loadingNextBatch;

  const loadingBatchLabel = useMemo(() => {
    if (!loadingScope) {
      return subTypeName ? ` para “${subTypeName}”` : '';
    }
    if (loadingScope.rangeStart && loadingScope.rangeEnd) {
      const totalSuffix = loadingScope.eligibleTotal
        ? ` de ${loadingScope.eligibleTotal}`
        : '';
      return ` — lote ${loadingScope.page}, itens ${loadingScope.rangeStart}–${loadingScope.rangeEnd}${totalSuffix}`;
    }
    return ` — lote ${loadingScope.page} (até ${loadingScope.limit} itens)`;
  }, [loadingScope, subTypeName]);

  const renderProcessingState = (compact?: boolean) => (
    <Box
      display="flex"
      flexDirection={compact ? 'row' : 'column'}
      alignItems={compact ? 'center' : 'flex-start'}
      gap={compact ? 1 : 1.5}
      py={compact ? 0 : 2}
      mb={compact ? 2 : 0}
    >
      <Box display="flex" alignItems="center" gap={1.5}>
        <CircularProgress size={compact ? 20 : 28} />
        <Typography variant={compact ? 'body2' : 'body1'} color="text.secondary">
          Processando lote com enriquecimento químico e IA. Lotes grandes podem
          levar alguns minutos.
          {loadingBatchLabel}
        </Typography>
      </Box>
      {!compact && (
        <Typography variant="body2" color="text.secondary" sx={{ pl: 5.5 }}>
          Para acelerar, use busca por nome/CAS antes de rodar IA.
        </Typography>
      )}
    </Box>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Revisão de candidatos sugeridos por IA</DialogTitle>
      <DialogContent>
        <Alert severity="info" sx={{ mb: 2 }}>
          Sugestões de IA exigem revisão técnica. Nada é salvo automaticamente.
          A confiança indica o grau de certeza da IA na decisão de incluir ou
          excluir — não é severidade toxicológica.
        </Alert>

        {loading && renderProcessingState()}

        {error && !loading && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {data && !loading && (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {scopeDescription}
            </Typography>

            <Typography variant="subtitle2" sx={{ mb: 2 }}>
              {formatSuggestBatchLabel(data.scope)}
              {batchesLoaded > 1
                ? ` · ${batchesLoaded} lotes carregados`
                : ''}
            </Typography>

            <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
              <Chip
                label={`Analisados (lote): ${data.scope.analyzed}`}
                size="small"
              />
              <Chip
                label={`Total analisado: ${cumulativeAnalyzed}`}
                size="small"
                variant="outlined"
              />
              <Chip
                label={`Acumulados na revisão: ${data.candidates.length}`}
                size="small"
                variant="outlined"
              />
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
              {data.scope.hasNextPage && (
                <Chip
                  label={`Há mais lotes (${data.scope.eligibleTotal} elegíveis)`}
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
              Exibindo {filteredCandidates.length} de {data.candidates.length}{' '}
              acumulados ({cumulativeAnalyzed} analisados no total).
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
              {data.scope.hasNextPage && onLoadNextBatch && (
                <Button
                  size="small"
                  variant="outlined"
                  disabled={isProcessingBatch}
                  onClick={() => {
                    if (isProcessingBatch) return;
                    onLoadNextBatch();
                  }}
                >
                  {loadingNextBatch
                    ? 'Analisando próximo lote…'
                    : 'Analisar próximo lote'}
                </Button>
              )}
            </Box>

            {loadingNextBatch && renderProcessingState(true)}

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
                        {data.scope.hasNextPage && onLoadNextBatch && (
                          <>
                            {' '}
                            Você pode analisar o próximo lote para continuar a busca.
                          </>
                        )}
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
          disabled={!selectedIds.length || applying || isProcessingBatch}
          onClick={() => onApplySelected(selectedIds)}
        >
          Aplicar selecionados ({selectedIds.length})
        </Button>
      </DialogActions>
    </Dialog>
  );
};
