import { SText } from '@v2/components/atoms/SText/SText';
import {
  commitChemicalSurveyImport,
  previewChemicalSurveyImport,
} from '@v2/services/security/characterization/chemical-product/service/chemical-product.service';
import type { ChemicalSurveyImportPreview } from '@v2/services/security/characterization/chemical-product/service/chemical-product.types';
import {
  Alert,
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
import { useState } from 'react';

type Props = {
  open: boolean;
  onClose: () => void;
  companyId: string;
  workspaceId: string;
  onCommitted?: () => void;
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

  const reset = () => {
    setFile(null);
    setPreview(null);
    setError(null);
    setBusy(false);
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
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Falha no preview SURVEY.',
      );
      setPreview(null);
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
                  </TableRow>
                </TableHead>
                <TableBody>
                  {preview.scenarios.map((row) => (
                    <TableRow key={row.clusterKey}>
                      <TableCell>{row.tradeName}</TableCell>
                      <TableCell>{row.manufacturer || '—'}</TableCell>
                      <TableCell>{row.activityName || '—'}</TableCell>
                      <TableCell>{row.sourceRows.join(', ')}</TableCell>
                      <TableCell>{row.productResolution}</TableCell>
                      <TableCell>
                        {row.canCommit
                          ? 'OK'
                          : row.blockers[0] || 'Bloqueado'}
                      </TableCell>
                    </TableRow>
                  ))}
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
