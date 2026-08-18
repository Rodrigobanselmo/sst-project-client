import { SText } from '@v2/components/atoms/SText/SText';
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
import { SIconSortArrowDown } from '@v2/assets/icons/SIconSortArrowDown/SIconSortArrowDown';
import { SIconSortArrowUp } from '@v2/assets/icons/SIconSortArrowUp/SIconSortArrowUp';
import { SIconUnfolderMore } from '@v2/assets/icons/SIconUnfolderMore/SIconUnfolderMore';
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
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
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
  formatUseScenarioBoardStatusChip,
  getScenarioActivityRiskFactors,
  getScenarioActivityRiskResolutions,
  isPendingSurveyBoardRow,
} from './chemical-use-scenario-activity-risk.util';
import {
  applyUseScenarioBoardView,
  EMPTY_USE_SCENARIO_BOARD_VIEW_FILTERS,
  formatUseScenarioBoardExposureGroupCell,
  hasActiveUseScenarioBoardView,
  nextUseScenarioBoardSort,
  USE_SCENARIO_BOARD_STATUS_FILTER_OPTIONS,
  type UseScenarioBoardViewFilters,
  type UseScenarioBoardViewSort,
  type UseScenarioBoardViewSortField,
} from './chemical-use-scenario-board-view.util';
import { ChemicalUseScenarioFormDialog } from './ChemicalUseScenarioFormDialog';
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

function SortableHeader({
  label,
  field,
  sort,
  onSort,
}: {
  label: string;
  field: UseScenarioBoardViewSortField;
  sort: UseScenarioBoardViewSort | null;
  onSort: (field: UseScenarioBoardViewSortField) => void;
}) {
  const direction = sort?.field === field ? sort.order : undefined;
  return (
    <TableCell
      onClick={() => onSort(field)}
      sx={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}
    >
      <Box display="flex" alignItems="center" gap={0.5}>
        {label}
        {!direction ? <SIconUnfolderMore /> : null}
        {direction === 'asc' ? (
          <SIconSortArrowDown color="primary.main" />
        ) : null}
        {direction === 'desc' ? (
          <SIconSortArrowUp color="primary.main" />
        ) : null}
      </Box>
    </TableCell>
  );
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
    setFilters(EMPTY_USE_SCENARIO_BOARD_VIEW_FILTERS);
    setSort(null);
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
          <TextField
            size="small"
            label="Buscar"
            value={filters.search}
            onChange={(e) => patchFilter('search', e.target.value)}
            sx={{ minWidth: 200, maxWidth: 280, flex: '1 1 200px' }}
          />
          <Button
            variant="contained"
            onClick={() => setCreateOpen(true)}
            sx={{ whiteSpace: 'nowrap' }}
          >
            Novo cenário
          </Button>
        </Stack>
      </Stack>
      {rows.length ? (
        <Stack
          direction="row"
          spacing={1}
          flexWrap="wrap"
          useFlexGap
          mb={1.5}
          alignItems="center"
        >
          <TextField
            size="small"
            label="Produto"
            value={filters.product}
            onChange={(e) => patchFilter('product', e.target.value)}
            sx={{ width: 140 }}
          />
          <TextField
            size="small"
            label="Fator de risco"
            value={filters.riskFactor}
            onChange={(e) => patchFilter('riskFactor', e.target.value)}
            sx={{ width: 150 }}
          />
          <TextField
            size="small"
            label="Tarefa"
            value={filters.activity}
            onChange={(e) => patchFilter('activity', e.target.value)}
            sx={{ width: 130 }}
          />
          <TextField
            size="small"
            label="Setor"
            value={filters.sector}
            onChange={(e) => patchFilter('sector', e.target.value)}
            sx={{ width: 130 }}
          />
          <TextField
            size="small"
            label="GSE"
            value={filters.exposureGroup}
            onChange={(e) => patchFilter('exposureGroup', e.target.value)}
            sx={{ width: 110 }}
          />
          <FormControl size="small" sx={{ width: 200 }}>
            <InputLabel>Status</InputLabel>
            <Select
              label="Status"
              value={filters.status}
              onChange={(e) => patchFilter('status', String(e.target.value))}
            >
              <MenuItem value="">Todos</MenuItem>
              {USE_SCENARIO_BOARD_STATUS_FILTER_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button size="small" onClick={clearView} disabled={!hasActiveView}>
            Limpar filtros
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => void exportPdf()}
            disabled={isExportingPdf || !visibleRows.length}
          >
            Exportar PDF
          </Button>
        </Stack>
      ) : null}
      {error ? <Alert severity="error">{error}</Alert> : null}
      {loading ? <SText fontSize={13}>Carregando…</SText> : null}
      {!loading && !rows.length ? (
        <Alert severity="info">
          Nenhum produto ACTIVE neste estabelecimento para exibir. Cadastre um
          produto na aba Produtos ou restaure um arquivado.
        </Alert>
      ) : null}
      {!loading && rows.length && !visibleRows.length ? (
        <Alert severity="info">
          Nenhum cenário corresponde aos filtros.
        </Alert>
      ) : null}
      {visibleRows.length ? (
        <Table size="small">
          <TableHead>
            <TableRow>
              <SortableHeader
                label="Produto"
                field="product"
                sort={sort}
                onSort={handleSort}
              />
              <SortableHeader
                label="Fator(es) de risco desta atividade"
                field="riskFactors"
                sort={sort}
                onSort={handleSort}
              />
              <SortableHeader
                label="Tarefa"
                field="activity"
                sort={sort}
                onSort={handleSort}
              />
              <SortableHeader
                label="Setor"
                field="sector"
                sort={sort}
                onSort={handleSort}
              />
              <SortableHeader
                label="GSE"
                field="exposureGroup"
                sort={sort}
                onSort={handleSort}
              />
              <SortableHeader
                label="Freq."
                field="frequency"
                sort={sort}
                onSort={handleSort}
              />
              <SortableHeader
                label="Duração"
                field="duration"
                sort={sort}
                onSort={handleSort}
              />
              <SortableHeader
                label="Qtd"
                field="quantity"
                sort={sort}
                onSort={handleSort}
              />
              <SortableHeader
                label="Linhas"
                field="sourceRows"
                sort={sort}
                onSort={handleSort}
              />
              <SortableHeader
                label="Status"
                field="status"
                sort={sort}
                onSort={handleSort}
              />
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {visibleRows.map((row) => {
              const factors = getScenarioActivityRiskFactors(row);
              const pending = isPendingSurveyBoardRow(row);
              return (
                <TableRow key={row.id}>
                  <TableCell>{row.product.tradeName}</TableCell>
                  <TableCell>
                    {formatActivityRiskFactorsListCell(factors, row)}
                  </TableCell>
                  <TableCell>{row.activityName || '—'}</TableCell>
                  <TableCell>{row.sectorSnapshot || '—'}</TableCell>
                  <TableCell>
                    {formatUseScenarioBoardExposureGroupCell(row)}
                  </TableCell>
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
                    <Chip
                      size="small"
                      label={formatUseScenarioBoardStatusChip(row)}
                      color={pending ? 'error' : 'default'}
                      variant="filled"
                      sx={
                        pending
                          ? {
                              backgroundColor: 'error.main',
                              color: 'common.white',
                              border: '1px solid',
                              borderColor: 'error.main',
                            }
                          : undefined
                      }
                    />
                  </TableCell>
                  <TableCell>
                    {canOpenUseScenarioBoardRow(row) ? (
                      <Button size="small" onClick={() => setSelected(row)}>
                        Abrir
                      </Button>
                    ) : null}
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
