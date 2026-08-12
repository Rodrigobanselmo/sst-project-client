import { SText } from '@v2/components/atoms/SText/SText';
import {
  commitChemicalSurveyImport,
  previewChemicalSurveyImport,
} from '@v2/services/security/characterization/chemical-product/service/chemical-product.service';
import type {
  ChemicalSurveyImportPreview,
  ChemicalSurveyPreviewScenario,
} from '@v2/services/security/characterization/chemical-product/service/chemical-product.types';
import {
  Alert,
  Box,
  Button,
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
} from '@mui/material';
import { Fragment, useState } from 'react';

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
        {row.durationMinutes == null
          ? '—'
          : `${row.durationMinutes} min`}
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
      <SText fontSize={13}>LINACH: {display(row.linachHint)}</SText>
      <SText fontSize={13}>Relevante: {display(row.relevanceHint)}</SText>
      <SText fontSize={13}>
        Linhas de origem ({display(row.sourceSheet)}):{' '}
        {row.sourceRows?.length ? row.sourceRows.join(', ') : '—'}
      </SText>
      <SText fontSize={13} fontWeight={600}>
        Componentes / % (sourceRaw)
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
      ) : (
        <SText fontSize={13} color="text.secondary">
          —
        </SText>
      )}
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
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  const reset = () => {
    setFile(null);
    setPreview(null);
    setError(null);
    setBusy(false);
    setExpandedKey(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handlePreview = async () => {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const result = await previewChemicalSurveyImport({
        companyId,
        workspaceId,
        file,
      });
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

  const handleCommit = async () => {
    if (!file || !preview) return;
    if (preview.summary.blockedCount > 0) {
      setError(
        'Há cenários bloqueados (produto ambíguo ou inexistente). Resolva productKeyMap antes do commit.',
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
      await commitChemicalSurveyImport({
        companyId,
        workspaceId,
        file,
      });
      onCommitted?.();
      handleClose();
    } catch (err: any) {
      const payload = err?.response?.data;
      setError(
        payload?.message ||
          err?.message ||
          'Falha no commit SURVEY.',
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
            produto (sem componente/CAS) e associa a ChemicalProducts já
            existentes. Não cria produto nem RiskFactorData.
          </SText>
          <input
            type="file"
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={(e) => {
              setFile(e.target.files?.[0] || null);
              setPreview(null);
              setExpandedKey(null);
            }}
          />
          {error ? <Alert severity="error">{error}</Alert> : null}
          {preview ? (
            <>
              <Alert severity="info">
                Linhas origem: {preview.summary.sourceRows} · Cenários:{' '}
                {preview.summary.scenarioClusters} · Únicos:{' '}
                {preview.summary.matchUnique} · Ambíguos:{' '}
                {preview.summary.matchAmbiguous} · Não encontrados:{' '}
                {preview.summary.matchNotFound}
              </Alert>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Produto</TableCell>
                    <TableCell>Fabricante</TableCell>
                    <TableCell>Tarefa</TableCell>
                    <TableCell>Linhas</TableCell>
                    <TableCell>Resolução</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell width={110} />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {preview.scenarios.map((row) => {
                    const openDetail = expandedKey === row.clusterKey;
                    return (
                      <Fragment key={row.clusterKey}>
                        <TableRow>
                          <TableCell>{row.tradeName}</TableCell>
                          <TableCell>{display(row.manufacturer)}</TableCell>
                          <TableCell>{display(row.activityName)}</TableCell>
                          <TableCell>
                            {row.sourceRows?.length
                              ? row.sourceRows.join(', ')
                              : '—'}
                          </TableCell>
                          <TableCell>{row.productResolution}</TableCell>
                          <TableCell>
                            {row.canCommit
                              ? 'OK'
                              : row.blockers[0] || 'Bloqueado'}
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
          Preview
        </Button>
        <Button
          variant="contained"
          disabled={!preview || busy || preview.summary.blockedCount > 0}
          onClick={handleCommit}
        >
          Confirmar cenários
        </Button>
      </DialogActions>
    </Dialog>
  );
};
