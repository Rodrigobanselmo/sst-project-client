import { SText } from '@v2/components/atoms/SText/SText';
import { STableFilterChip } from '@v2/components/organisms/STable/addons/addons-table/STableFilterChip/STableFilterChip';
import { STableFilterChipList } from '@v2/components/organisms/STable/addons/addons-table/STableFilterChipList/STableFilterChipList';
import { STableInfoSection } from '@v2/components/organisms/STable/addons/addons-table/STableInfoSection/STableInfoSection';
import { STableColumnsButton } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableButton/components/STableColumnsButton/STableColumnsButton';
import { STableFilterButton } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableButton/components/STableFilterButton/STableFilterButton';
import { STableSearchContent } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableSearchContent/STableSearchContent';
import { STableSearch } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/STableSearch';
import { persistKeys, usePersistedState } from '@v2/hooks/usePersistState';
import {
  browseChemicalUseScenarioBoard,
  searchChemicalRiskFactors,
  updateChemicalIngredientRiskFactor,
} from '@v2/services/security/characterization/chemical-product/service/chemical-product.service';
import type {
  ChemicalRiskOption,
  ChemicalUseScenarioActivityRiskResolution,
  ChemicalUseScenarioBoardRow,
} from '@v2/services/security/characterization/chemical-product/service/chemical-product.types';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useEffect, useMemo, useState } from 'react';

import { SPdfLoadingModal } from '@v2/components/organisms/SPdfLoadingModal/SPdfLoadingModal';

import {
  canOpenUseScenarioBoardRow,
  canReviewScenarioActivityCorrelation,
  formatActivityRiskFactorsListCell,
  formatScenarioActivityCorrelationStatus,
  getScenarioActivityRiskFactors,
  getScenarioActivityRiskResolutions,
  isPendingSurveyBoardRow,
} from './chemical-use-scenario-activity-risk.util';
import {
  applyUseScenarioBoardView,
  EMPTY_USE_SCENARIO_BOARD_VIEW_FILTERS,
  formatUseScenarioBoardExposureGroupCell,
  hasActiveUseScenarioBoardView,
  listUseScenarioBoardFilterChips,
  listUseScenarioBoardFilterOptions,
  nextUseScenarioBoardSort,
  type UseScenarioBoardViewFilters,
  type UseScenarioBoardViewSort,
  type UseScenarioBoardViewSortField,
} from './chemical-use-scenario-board-view.util';
import {
  ChemicalUseScenarioColumnsEnum,
  chemicalUseScenarioColumns,
} from './chemical-use-scenario-table-columns';
import { ChemicalUseScenarioFormDialog } from './ChemicalUseScenarioFormDialog';
import { ChemicalUseScenariosTable } from './ChemicalUseScenariosTable';
import { ChemicalUseScenariosTableFilter } from './ChemicalUseScenariosTableFilter';
import { exportUseScenarioBoardPdfInBrowser } from './exportUseScenarioBoardPdfInBrowser';

type Props = {
  companyId: string;
  workspaceId: string;
  chemicalProductId?: string;
  refreshKey?: number;
};

type ReviewTarget = {
  scenario: ChemicalUseScenarioBoardRow;
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
  const { enqueueSnackbar } = useSnackbar();
  const [rows, setRows] = useState<ChemicalUseScenarioBoardRow[]>([]);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [pdfLoadingMessage, setPdfLoadingMessage] = useState('');
  const [filters, setFilters] = useState<UseScenarioBoardViewFilters>(
    EMPTY_USE_SCENARIO_BOARD_VIEW_FILTERS,
  );
  const [sort, setSort] = useState<UseScenarioBoardViewSort | null>(null);
  const [searchFieldKey, setSearchFieldKey] = useState(0);
  const [hiddenColumns, setHiddenColumns] = usePersistedState<
    Record<ChemicalUseScenarioColumnsEnum, boolean>
  >(
    persistKeys.COLUMNS_CHEMICAL_USE_SCENARIOS,
    {} as Record<ChemicalUseScenarioColumnsEnum, boolean>,
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<ChemicalUseScenarioBoardRow | null>(
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
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    browseChemicalUseScenarioBoard({
      companyId,
      workspaceId,
      chemicalProductId,
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

  const visibleRows = useMemo(
    () => applyUseScenarioBoardView(rows, { filters, sort }),
    [rows, filters, sort],
  );
  const filterOptions = useMemo(
    () => listUseScenarioBoardFilterOptions(rows),
    [rows],
  );
  const filterChips = useMemo(
    () => listUseScenarioBoardFilterChips(filters, sort, filterOptions),
    [filters, sort, filterOptions],
  );

  const selectedResolutions = selected
    ? getScenarioActivityRiskResolutions(selected)
    : [];
  const selectedFactors = selected
    ? getScenarioActivityRiskFactors(selected)
    : [];

  const openReview = (
    scenario: ChemicalUseScenarioBoardRow,
    resolution: ChemicalUseScenarioActivityRiskResolution,
  ) => {
    if (isPendingSurveyBoardRow(scenario)) return;
    if (!canOpenUseScenarioBoardRow(scenario)) return;
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
    if (isPendingSurveyBoardRow(reviewTarget.scenario)) return;
    if (!canOpenUseScenarioBoardRow(reviewTarget.scenario)) return;
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

  const patchFilter = (
    field: keyof UseScenarioBoardViewFilters,
    value: string,
  ) => {
    setFilters((current) => ({ ...current, [field]: value }));
  };

  const handleSort = (field: UseScenarioBoardViewSortField) => {
    setSort((current) => nextUseScenarioBoardSort(current, field));
  };

  const hasActiveView = hasActiveUseScenarioBoardView(filters, sort);

  const clearView = () => {
    setFilters({ ...EMPTY_USE_SCENARIO_BOARD_VIEW_FILTERS });
    setSort(null);
    setSearchFieldKey((key) => key + 1);
  };

  const exportPdf = async () => {
    if (isExportingPdf) return;
    if (!visibleRows.length) {
      enqueueSnackbar('Nenhum cenário corresponde aos filtros atuais.', {
        variant: 'warning',
      });
      return;
    }
    setIsExportingPdf(true);
    setPdfLoadingMessage('Iniciando geração do PDF...');
    try {
      await exportUseScenarioBoardPdfInBrowser(
        {
          visibleRows,
          filters,
          sort,
        },
        (message) => setPdfLoadingMessage(message),
      );
      enqueueSnackbar('PDF gerado com sucesso!', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(
        err instanceof Error
          ? err.message
          : 'Não foi possível gerar o PDF dos cenários de uso.',
        { variant: 'error' },
      );
    } finally {
      setIsExportingPdf(false);
      setPdfLoadingMessage('');
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
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          flexWrap="wrap"
          useFlexGap
        >
          <Button
            variant="outlined"
            onClick={() => void exportPdf()}
            disabled={isExportingPdf || !visibleRows.length}
            sx={{ whiteSpace: 'nowrap' }}
          >
            Exportar PDF
          </Button>
          <Button
            variant="contained"
            onClick={() => setCreateOpen(true)}
            sx={{ whiteSpace: 'nowrap' }}
          >
            Novo cenário
          </Button>
        </Stack>
      </Stack>
      <STableSearch
        key={searchFieldKey}
        search={filters.search}
        autoFocus={false}
        onSearch={(search) => patchFilter('search', search)}
        inputProps={{
          placeholder:
            'Buscar produto, fabricante, fator, tarefa, setor, GSE ou status',
        }}
      >
        <STableSearchContent>
          {null}
          <STableColumnsButton
            showLabel
            hiddenColumns={hiddenColumns}
            setHiddenColumns={setHiddenColumns}
            columns={chemicalUseScenarioColumns}
          />
          <STableFilterButton text="Filtros">
            <ChemicalUseScenariosTableFilter
              filters={filters}
              options={filterOptions}
              onFilterChange={(patch) =>
                setFilters((current) => ({ ...current, ...patch }))
              }
            />
          </STableFilterButton>
        </STableSearchContent>
      </STableSearch>
      {filterChips.length ? (
        <STableInfoSection>
          <STableFilterChipList onClean={clearView}>
            {filterChips.map((chip) => (
              <STableFilterChip
                key={chip.key}
                leftLabel={chip.leftLabel}
                label={chip.label}
                onDelete={() => {
                  if (chip.key === 'sort') {
                    setSort(null);
                    return;
                  }
                  if (chip.key === 'search') {
                    patchFilter('search', '');
                    setSearchFieldKey((key) => key + 1);
                    return;
                  }
                  patchFilter(
                    chip.key as keyof UseScenarioBoardViewFilters,
                    EMPTY_USE_SCENARIO_BOARD_VIEW_FILTERS[
                      chip.key as keyof UseScenarioBoardViewFilters
                    ],
                  );
                }}
              />
            ))}
          </STableFilterChipList>
        </STableInfoSection>
      ) : null}
      {error ? <Alert severity="error">{error}</Alert> : null}
      {!loading && !rows.length ? (
        <Alert severity="info">
          Nenhum produto ACTIVE neste estabelecimento para exibir. Cadastre um
          produto na aba Produtos ou restaure um arquivado.
        </Alert>
      ) : null}
      {rows.length || loading ? (
        <ChemicalUseScenariosTable
          rows={visibleRows}
          isLoading={loading}
          hiddenColumns={hiddenColumns}
          sort={sort}
          onSortField={handleSort}
          emptyMessage={
            hasActiveView
              ? 'Nenhum cenário corresponde aos filtros.'
              : 'Nenhum cenário de uso neste estabelecimento.'
          }
          onOpen={setSelected}
        />
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
              {selected.activityRiskOrigin === 'PRODUCT_COMPOSITION' ||
              isPendingSurveyBoardRow(selected) ? (
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
                      {canReview &&
                      !isPendingSurveyBoardRow(selected) ? (
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
      <ChemicalUseScenarioFormDialog
        open={createOpen}
        companyId={companyId}
        workspaceId={workspaceId}
        onClose={() => setCreateOpen(false)}
        onCreated={() => {
          enqueueSnackbar('Cenário de uso criado com sucesso.', {
            variant: 'success',
          });
          setListRefresh((n) => n + 1);
        }}
      />
      <SPdfLoadingModal open={isExportingPdf} message={pdfLoadingMessage} />
    </Box>
  );
};
