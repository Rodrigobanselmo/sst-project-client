import { SText } from '@v2/components/atoms/SText/SText';
import {
  browseChemicalUseScenarios,
  searchChemicalRiskFactors,
  updateChemicalIngredientRiskFactor,
} from '@v2/services/security/characterization/chemical-product/service/chemical-product.service';
import type {
  ChemicalRiskOption,
  ChemicalUseScenarioActivityRiskResolution,
  ChemicalUseScenarioListItem,
} from '@v2/services/security/characterization/chemical-product/service/chemical-product.types';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
} from '@mui/material';
import { useEffect, useState } from 'react';

import {
  canReviewScenarioActivityCorrelation,
  formatActivityRiskFactorsListCell,
  formatScenarioActivityCorrelationStatus,
  getScenarioActivityRiskFactors,
  getScenarioActivityRiskResolutions,
} from './chemical-use-scenario-activity-risk.util';

type Props = {
  companyId: string;
  workspaceId: string;
  chemicalProductId?: string;
  refreshKey?: number;
};

type ReviewTarget = {
  scenario: ChemicalUseScenarioListItem;
  resolution: ChemicalUseScenarioActivityRiskResolution;
};

function riskLabel(option: ChemicalRiskOption) {
  return option.cas ? `${option.name} · CAS ${option.cas}` : option.name;
}

export const ChemicalUseScenariosPanel = ({
  companyId,
  workspaceId,
  chemicalProductId,
  refreshKey = 0,
}: Props) => {
  const [rows, setRows] = useState<ChemicalUseScenarioListItem[]>([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<ChemicalUseScenarioListItem | null>(
    null,
  );
  const [listRefresh, setListRefresh] = useState(0);

  const [reviewTarget, setReviewTarget] = useState<ReviewTarget | null>(null);
  const [riskOptions, setRiskOptions] = useState<ChemicalRiskOption[]>([]);
  const [riskSearch, setRiskSearch] = useState('');
  const [selectedRisk, setSelectedRisk] = useState<ChemicalRiskOption | null>(
    null,
  );
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSaving, setReviewSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    browseChemicalUseScenarios({
      companyId,
      workspaceId,
      chemicalProductId,
      search: search || undefined,
    })
      .then((data) => {
        if (cancelled) return;
        setRows(data);
        setSelected((current) => {
          if (!current) return null;
          return data.find((row) => row.id === current.id) || null;
        });
      })
      .catch((err: any) => {
        if (!cancelled) {
          setError(
            err?.response?.data?.message ||
              'Não foi possível carregar os cenários de uso.',
          );
          setRows([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [
    companyId,
    workspaceId,
    chemicalProductId,
    search,
    refreshKey,
    listRefresh,
  ]);

  useEffect(() => {
    if (!reviewTarget) return;
    let cancelled = false;
    const handle = window.setTimeout(() => {
      searchChemicalRiskFactors({
        companyId,
        workspaceId,
        search: riskSearch || undefined,
      })
        .then((data) => {
          if (!cancelled) setRiskOptions(data);
        })
        .catch(() => {
          if (!cancelled) setRiskOptions([]);
        });
    }, 250);
    return () => {
      cancelled = true;
      window.clearTimeout(handle);
    };
  }, [reviewTarget, companyId, workspaceId, riskSearch]);

  const selectedResolutions = selected
    ? getScenarioActivityRiskResolutions(selected)
    : [];
  const selectedFactors = selected
    ? getScenarioActivityRiskFactors(selected)
    : [];

  const openReview = (
    scenario: ChemicalUseScenarioListItem,
    resolution: ChemicalUseScenarioActivityRiskResolution,
  ) => {
    if (!canReviewScenarioActivityCorrelation(resolution)) return;
    setReviewError(null);
    setSelectedRisk(
      resolution.status === 'RESOLVED' && resolution.riskFactor
        ? {
            id: resolution.riskFactor.id,
            name: resolution.riskFactor.name,
            cas: resolution.riskFactor.cas,
            system: resolution.riskFactor.system,
            companyId: resolution.riskFactor.companyId,
            type: resolution.riskFactor.type,
          }
        : null,
    );
    setRiskSearch('');
    setRiskOptions([]);
    setReviewTarget({ scenario, resolution });
  };

  const closeReview = () => {
    if (reviewSaving) return;
    setReviewTarget(null);
    setSelectedRisk(null);
    setReviewError(null);
  };

  const saveReview = async () => {
    if (!reviewTarget || !selectedRisk || !reviewTarget.resolution.ingredientId) {
      return;
    }
    const previousId =
      reviewTarget.resolution.status === 'RESOLVED'
        ? reviewTarget.resolution.riskFactor.id
        : null;
    if (previousId && previousId !== selectedRisk.id) {
      const ok = window.confirm(
        `Trocar o fator de risco atual por "${riskLabel(selectedRisk)}"?`,
      );
      if (!ok) return;
    }

    setReviewSaving(true);
    setReviewError(null);
    try {
      await updateChemicalIngredientRiskFactor({
        companyId,
        workspaceId,
        productId: reviewTarget.scenario.chemicalProductId,
        ingredientId: reviewTarget.resolution.ingredientId,
        riskFactorId: selectedRisk.id,
      });
      setReviewTarget(null);
      setSelectedRisk(null);
      setListRefresh((n) => n + 1);
    } catch (err: any) {
      setReviewError(
        err?.response?.data?.message ||
          'Não foi possível salvar a correlação.',
      );
    } finally {
      setReviewSaving(false);
    }
  };

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1}
        alignItems={{ sm: 'center' }}
        justifyContent="space-between"
        mb={1.5}
      >
        <SText fontWeight={700}>Cenários de uso</SText>
        <TextField
          size="small"
          label="Buscar tarefa / setor / produto"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ minWidth: 260 }}
        />
      </Stack>
      {error ? <Alert severity="error">{error}</Alert> : null}
      {loading ? <SText fontSize={13}>Carregando…</SText> : null}
      {!loading && !rows.length ? (
        <Alert severity="info">
          Nenhum cenário de uso cadastrado. Use “Importar levantamento
          (SURVEY)” ou crie via API após a migration.
        </Alert>
      ) : null}
      {rows.length ? (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Produto</TableCell>
              <TableCell>Fator(es) de risco desta atividade</TableCell>
              <TableCell>Tarefa</TableCell>
              <TableCell>Setor</TableCell>
              <TableCell>Freq.</TableCell>
              <TableCell>Duração</TableCell>
              <TableCell>Qtd</TableCell>
              <TableCell>Linhas</TableCell>
              <TableCell>Status</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => {
              const factors = getScenarioActivityRiskFactors(row);
              return (
                <TableRow key={row.id}>
                  <TableCell>{row.product.tradeName}</TableCell>
                  <TableCell>
                    {formatActivityRiskFactorsListCell(factors, row)}
                  </TableCell>
                  <TableCell>{row.activityName || '—'}</TableCell>
                  <TableCell>{row.sectorSnapshot || '—'}</TableCell>
                  <TableCell>
                    {row.frequencyCount != null
                      ? `${row.frequencyCount} ${row.frequencyPeriod || ''}`
                      : '—'}
                  </TableCell>
                  <TableCell>
                    {row.durationMinutes != null
                      ? `${row.durationMinutes} min`
                      : '—'}
                  </TableCell>
                  <TableCell>
                    {row.quantity
                      ? `${row.quantity} ${row.quantityUnit || ''}`
                      : '—'}
                  </TableCell>
                  <TableCell>
                    {(row.sourceRows || []).join(', ') || '—'}
                  </TableCell>
                  <TableCell>
                    <Chip size="small" label={row.surveyStatus} />
                  </TableCell>
                  <TableCell>
                    <Button size="small" onClick={() => setSelected(row)}>
                      Abrir
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      ) : null}

      <Dialog
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Cenário de uso</DialogTitle>
        <DialogContent>
          {selected ? (
            <Stack spacing={1.5} mt={1}>
              <SText fontWeight={700}>{selected.product.tradeName}</SText>
              <SText fontSize={13} color="text.secondary">
                {selected.product.manufacturer
                  ? `Fabricante: ${selected.product.manufacturer}`
                  : 'Sem fabricante'}
              </SText>
              <SText fontSize={13}>Tarefa: {selected.activityName || '—'}</SText>
              <SText fontSize={13}>
                Setor: {selected.sectorSnapshot || '—'} · GHE/GSE:{' '}
                {selected.exposureGroupSnapshot || '—'} · Cargos:{' '}
                {selected.exposedRolesSnapshot || '—'}
              </SText>
              <SText fontSize={13}>
                Frequência: {selected.frequencyCount ?? '—'}{' '}
                {selected.frequencyPeriod || ''} · Duração:{' '}
                {selected.durationMinutes ?? '—'} min · Quantidade:{' '}
                {selected.quantity || '—'} {selected.quantityUnit || ''}
              </SText>
              <SText fontSize={13}>
                Contato: {selected.peakContactMoment || '—'} · Controles:{' '}
                {selected.controlMeasures || '—'}
              </SText>
              <SText fontSize={13}>
                Linhas-fonte ({selected.sourceSheet || '—'}):{' '}
                {(selected.sourceRows || []).join(', ') || '—'}
              </SText>

              <SText fontWeight={600}>
                Fator(es) de risco desta atividade
              </SText>
              {selected.activityRiskOrigin === 'PRODUCT_COMPOSITION' ? (
                selectedFactors.length ? (
                  selectedFactors.map((factor) => (
                    <SText key={factor.id} fontSize={13}>
                      {factor.name}
                      {factor.cas ? ` · CAS ${factor.cas}` : ''}
                    </SText>
                  ))
                ) : (
                  <SText fontSize={13} color="text.secondary">
                    {formatActivityRiskFactorsListCell([], selected)}
                  </SText>
                )
              ) : selectedResolutions.length ? (
                selectedResolutions.map((item) => {
                  const key = `${item.sourceRow}-${item.component || ''}-${item.resolution}`;
                  const canReview = canReviewScenarioActivityCorrelation(item);
                  const isPrimaryAction =
                    canReview &&
                    item.status === 'UNRESOLVED' &&
                    item.resolution === 'UNLINKED';
                  return (
                    <Stack
                      key={key}
                      direction={{ xs: 'column', sm: 'row' }}
                      spacing={1}
                      alignItems={{ sm: 'center' }}
                      justifyContent="space-between"
                    >
                      <SText
                        fontSize={13}
                        color={
                          item.status === 'RESOLVED'
                            ? undefined
                            : 'text.secondary'
                        }
                      >
                        Linha {item.sourceRow}:{' '}
                        {item.componentOriginal || item.component || '—'}
                        {' → '}
                        {formatScenarioActivityCorrelationStatus(item)}
                      </SText>
                      {canReview ? (
                        <Button
                          size="small"
                          variant={isPrimaryAction ? 'contained' : 'text'}
                          onClick={() => openReview(selected, item)}
                        >
                          Revisar correlação
                        </Button>
                      ) : null}
                    </Stack>
                  );
                })
              ) : (
                <SText fontSize={13} color="text.secondary">
                  Não correlacionado
                </SText>
              )}
              {selected.activityRiskOrigin !== 'PRODUCT_COMPOSITION' &&
              !selectedFactors.length &&
              selectedResolutions.length ? (
                <SText fontSize={12} color="text.secondary">
                  Nenhum fator resolvido por proveniência TECHNICAL para as
                  linhas deste cenário.
                </SText>
              ) : null}

              <SText fontWeight={600}>Composição herdada do produto</SText>
              {(selected.product.activeComposition?.ingredients || []).map(
                (ingredient) => (
                  <SText key={ingredient.id} fontSize={13}>
                    {ingredient.chemicalName}
                    {ingredient.cas ? ` · CAS ${ingredient.cas}` : ''}
                  </SText>
                ),
              )}
              {!selected.product.activeComposition?.ingredients?.length ? (
                <SText fontSize={13} color="text.secondary">
                  Sem composição ACTIVE neste produto.
                </SText>
              ) : null}
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelected(null)}>Fechar</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(reviewTarget)}
        onClose={closeReview}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Revisar correlação</DialogTitle>
        <DialogContent>
          {reviewTarget ? (
            <Stack spacing={1.5} mt={1}>
              <SText fontSize={13}>
                Linha {reviewTarget.resolution.sourceRow}:{' '}
                {reviewTarget.resolution.componentOriginal ||
                  reviewTarget.resolution.component ||
                  '—'}
              </SText>
              <SText fontSize={12} color="text.secondary">
                Selecione um fator de risco existente no catálogo SimpleSST.
                Apenas o vínculo do ingrediente será atualizado.
              </SText>
              <Autocomplete
                options={riskOptions}
                value={selectedRisk}
                onChange={(_, value) => setSelectedRisk(value)}
                onInputChange={(_, value, reason) => {
                  if (reason === 'input') setRiskSearch(value);
                }}
                getOptionLabel={riskLabel}
                isOptionEqualToValue={(a, b) => a.id === b.id}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Fator de risco (global ou da empresa)"
                    helperText="Busca o mesmo catálogo usado no módulo químico"
                  />
                )}
              />
              {reviewError ? (
                <Alert severity="error">{reviewError}</Alert>
              ) : null}
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeReview} disabled={reviewSaving}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={() => void saveReview()}
            disabled={!selectedRisk || reviewSaving}
          >
            {reviewSaving ? 'Salvando…' : 'Salvar correlação'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
