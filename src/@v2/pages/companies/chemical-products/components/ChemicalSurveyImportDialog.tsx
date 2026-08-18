import { SText } from '@v2/components/atoms/SText/SText';
import { useFetchBrowseChemicalProducts } from '@v2/services/security/characterization/chemical-product/hooks/useFetchBrowseChemicalProducts';
import {
  commitChemicalSurveyImport,
  previewChemicalSurveyImport,
} from '@v2/services/security/characterization/chemical-product/service/chemical-product.service';
import type {
  ChemicalProductListItem,
  ChemicalSurveyImportPreview,
  ChemicalSurveyPreviewScenario,
} from '@v2/services/security/characterization/chemical-product/service/chemical-product.types';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import { Fragment, useMemo, useState } from 'react';

import {
  surveyCommitEnabled,
  surveyRowNeedsManualResolution,
  toSurveyProductKeyMap,
  type SurveyProductKeySelection,
} from './chemical-survey-import-resolution.util';

type Props = {
  open: boolean;
  onClose: () => void;
  companyId: string;
  workspaceId: string;
  onCommitted?: () => void;
};

const display = (value: string | number | null | undefined) => {
  if (value == null) return '—';
  const text = String(value).trim();
  return text ? text : '—';
};

const productLabel = (product: {
  tradeName: string;
  manufacturer: string | null;
}) =>
  product.manufacturer
    ? `${product.tradeName} · ${product.manufacturer}`
    : product.tradeName;

const surveyResolutionChipColor = (
  resolution: ChemicalSurveyPreviewScenario['productResolution'],
): 'success' | 'warning' | 'error' | 'default' => {
  if (resolution === 'MATCH_UNIQUE') return 'success';
  if (resolution === 'MATCH_AMBIGUOUS') return 'warning';
  if (resolution === 'MATCH_NOT_FOUND') return 'error';
  return 'default';
};

const surveyResolutionLabel = (row: ChemicalSurveyPreviewScenario) =>
  row.resolutionSource
    ? `${row.productResolution} · ${row.resolutionSource}`
    : row.productResolution;

const SurveyPreviewScenarioDetail = ({
  row,
}: {
  row: ChemicalSurveyPreviewScenario;
}) => {
  const sourceLines = row.sourceRaw?.lines || [];
  return (
    <Stack spacing={1}>
      <SText fontSize={13}>Produto: {display(row.tradeName)}</SText>
      <SText fontSize={13}>Fabricante: {display(row.manufacturer)}</SText>
      <SText fontSize={13}>
        Matcher automático: {display(row.automaticResolution || row.productResolution)}
      </SText>
      <SText fontSize={13}>
        Resolução: {row.productResolution}
        {row.resolutionSource ? ` · ${row.resolutionSource}` : ''}
      </SText>
      <SText fontSize={13}>UUID: {display(row.chemicalProductId)}</SText>
      <SText fontSize={13}>Setor: {display(row.sectorSnapshot)}</SText>
      <SText fontSize={13}>
        GHE / grupo de exposição: {display(row.exposureGroupSnapshot)}
      </SText>
      <SText fontSize={13}>
        Cargos expostos: {display(row.exposedRolesSnapshot)}
      </SText>
      <SText fontSize={13}>Tarefa: {display(row.activityName)}</SText>
      <SText fontSize={13}>
        Frequência:{' '}
        {row.frequencyCount == null && !String(row.frequencyPeriod || '').trim()
          ? '—'
          : `${display(row.frequencyCount)}${
              String(row.frequencyPeriod || '').trim()
                ? ` ${String(row.frequencyPeriod).trim()}`
                : ''
            }`}
      </SText>
      <SText fontSize={13}>
        Duração:{' '}
        {row.durationMinutes == null ? '—' : `${row.durationMinutes} min`}
      </SText>
      <SText fontSize={13}>
        Quantidade:{' '}
        {!String(row.quantity || '').trim() &&
        !String(row.quantityUnit || '').trim()
          ? '—'
          : `${display(row.quantity)}${
              String(row.quantityUnit || '').trim()
                ? ` ${String(row.quantityUnit).trim()}`
                : ''
            }`}
      </SText>
      <SText fontSize={13}>
        Momento de maior contato: {display(row.peakContactMoment)}
      </SText>
      <SText fontSize={13}>
        Medidas de controle: {display(row.controlMeasures)}
      </SText>
      {row.blockers?.length ? (
        <SText fontSize={13} color="error.main">
          {row.blockers.join(' ')}
        </SText>
      ) : null}
      <SText fontSize={13}>
        Linhas de origem ({display(row.sourceSheet)}):{' '}
        {row.sourceRows?.length ? row.sourceRows.join(', ') : '—'}
      </SText>
      {sourceLines.length ? (
        <Box sx={{ pl: 1 }}>
          {sourceLines.map((line) => (
            <SText key={`${row.clusterKey}-${line.sourceRow}`} fontSize={12}>
              Linha {line.sourceRow}: {display(line.component)} · %{' '}
              {display(line.percentRaw)}
            </SText>
          ))}
        </Box>
      ) : null}
    </Stack>
  );
};

export const ChemicalSurveyImportDialog = ({
  open,
  onClose,
  companyId,
  workspaceId,
  onCommitted,
}: Props) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ChemicalSurveyImportPreview | null>(
    null,
  );
  const [selections, setSelections] = useState<SurveyProductKeySelection>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  const { data: products } = useFetchBrowseChemicalProducts(
    { companyId, workspaceId, includeArchived: false },
    open,
  );

  const activeProducts = useMemo(
    () =>
      (products || []).filter(
        (product: ChemicalProductListItem) => product.status === 'ACTIVE',
      ),
    [products],
  );

  const reset = () => {
    setFile(null);
    setPreview(null);
    setSelections({});
    setError(null);
    setBusy(false);
    setExpandedKey(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const runPreview = async (
    nextFile: File,
    nextSelections: SurveyProductKeySelection,
    currentPreview: ChemicalSurveyImportPreview | null,
  ) => {
    const productKeyMap = toSurveyProductKeyMap(
      currentPreview?.scenarios || [],
      nextSelections,
    );
    return previewChemicalSurveyImport({
      companyId,
      workspaceId,
      file: nextFile,
      productKeyMap: productKeyMap.length ? productKeyMap : undefined,
    });
  };

  const handlePreview = async () => {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const result = await runPreview(file, selections, preview);
      setPreview(result);
      setExpandedKey(null);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Falha no preview SURVEY.',
      );
      setPreview(null);
      setExpandedKey(null);
    } finally {
      setBusy(false);
    }
  };

  const handleSelectProduct = async (productKey: string, productId: string) => {
    if (!file) return;
    const nextSelections = { ...selections, [productKey]: productId };
    setSelections(nextSelections);
    setBusy(true);
    setError(null);
    try {
      const result = await runPreview(file, nextSelections, preview);
      setPreview(result);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Falha ao revalidar preview SURVEY.',
      );
    } finally {
      setBusy(false);
    }
  };

  const handleCommit = async () => {
    if (!file || !preview) return;
    if (preview.summary.blockedCount > 0) {
      setError(
        'Há cenários bloqueados (produto ambíguo ou inexistente). Resolva o produto antes do commit.',
      );
      return;
    }
    const ok = window.confirm(
      `Confirmar import SURVEY?\n${preview.summary.scenarioClusters} cenário(s) a partir de ${preview.summary.sourceRows} linha(s).\nNenhum ChemicalProduct será criado.`,
    );
    if (!ok) return;
    setBusy(true);
    setError(null);
    try {
      const productKeyMap = toSurveyProductKeyMap(
        preview.scenarios,
        selections,
      );
      await commitChemicalSurveyImport({
        companyId,
        workspaceId,
        file,
        productKeyMap: productKeyMap.length ? productKeyMap : undefined,
      });
      onCommitted?.();
      handleClose();
    } catch (err: any) {
      const payload = err?.response?.data;
      setError(
        payload?.message || err?.message || 'Falha no commit SURVEY.',
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="lg">
      <DialogTitle>Importar levantamento (SURVEY)</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <SText fontSize={13} color="text.secondary">
            Fluxo separado do Excel TECHNICAL. Agrupa cenários de uso do
            produto e associa a ChemicalProducts já existentes. Não cria
            produto, composição nem RiskFactor. Linhas sem match UNIQUE
            exigem escolha explícita do UUID.
          </SText>
          <input
            type="file"
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={(e) => {
              setFile(e.target.files?.[0] || null);
              setPreview(null);
              setSelections({});
              setExpandedKey(null);
            }}
          />
          {error ? <Alert severity="error">{error}</Alert> : null}
          {preview ? (
            <>
              <Alert
                severity={preview.summary.blockedCount ? 'warning' : 'info'}
              >
                Linhas origem: {preview.summary.sourceRows} · Cenários:{' '}
                {preview.summary.scenarioClusters} · Únicos:{' '}
                {preview.summary.matchUnique} · Ambíguos:{' '}
                {preview.summary.matchAmbiguous} · Não encontrados:{' '}
                {preview.summary.matchNotFound} · Bloqueados:{' '}
                {preview.summary.blockedCount}
              </Alert>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Produto</TableCell>
                    <TableCell>Fabricante</TableCell>
                    <TableCell>Tarefa</TableCell>
                    <TableCell>Duração / qtd</TableCell>
                    <TableCell>Resolução</TableCell>
                    <TableCell>Produto no cadastro</TableCell>
                    <TableCell width={110} />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {preview.scenarios.map((row) => {
                    const openDetail = expandedKey === row.clusterKey;
                    const needsManual = surveyRowNeedsManualResolution(row);
                    return (
                      <Fragment key={row.clusterKey}>
                        <TableRow>
                          <TableCell>{row.tradeName}</TableCell>
                          <TableCell>{display(row.manufacturer)}</TableCell>
                          <TableCell>{display(row.activityName)}</TableCell>
                          <TableCell>
                            {display(
                              row.durationMinutes == null
                                ? null
                                : `${row.durationMinutes} min`,
                            )}
                            {' · '}
                            {display(row.quantity)} {display(row.quantityUnit)}
                          </TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              variant="outlined"
                              color={surveyResolutionChipColor(
                                row.productResolution,
                              )}
                              label={surveyResolutionLabel(row)}
                            />
                            <Box component="div" sx={{ color: 'text.secondary', fontSize: 12, mt: 0.5 }}>
                              {row.canCommit
                                ? display(row.chemicalProductId)
                                : row.blockers[0] || 'Bloqueado'}
                            </Box>
                          </TableCell>
                          <TableCell sx={{ minWidth: 240 }}>
                            {needsManual ? (
                              <Select
                                size="small"
                                fullWidth
                                displayEmpty
                                disabled={busy}
                                value={selections[row.productKey] || ''}
                                onChange={(event) =>
                                  handleSelectProduct(
                                    row.productKey,
                                    String(event.target.value || ''),
                                  )
                                }
                              >
                                <MenuItem value="">
                                  Selecionar produto ACTIVE
                                </MenuItem>
                                {activeProducts.map((product) => (
                                  <MenuItem key={product.id} value={product.id}>
                                    {productLabel(product)}
                                  </MenuItem>
                                ))}
                              </Select>
                            ) : (
                              display(
                                row.chemicalProductId
                                  ? productLabel({
                                      tradeName: row.tradeName,
                                      manufacturer: row.manufacturer,
                                    })
                                  : null,
                              )
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="small"
                              onClick={() =>
                                setExpandedKey(
                                  openDetail ? null : row.clusterKey,
                                )
                              }
                            >
                              {openDetail ? 'Ocultar' : 'Detalhes'}
                            </Button>
                          </TableCell>
                        </TableRow>
                        {openDetail ? (
                          <TableRow>
                            <TableCell colSpan={7} sx={{ bgcolor: 'grey.50' }}>
                              <SurveyPreviewScenarioDetail row={row} />
                            </TableCell>
                          </TableRow>
                        ) : null}
                      </Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            </>
          ) : null}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancelar</Button>
        <Button disabled={!file || busy} onClick={handlePreview}>
          {preview ? 'Revalidar preview' : 'Preview'}
        </Button>
        <Button
          variant="contained"
          disabled={
            !surveyCommitEnabled({
              hasPreview: Boolean(preview),
              busy,
              blockedCount: preview?.summary.blockedCount ?? 1,
            })
          }
          onClick={handleCommit}
        >
          Confirmar cenários
        </Button>
      </DialogActions>
    </Dialog>
  );
};
