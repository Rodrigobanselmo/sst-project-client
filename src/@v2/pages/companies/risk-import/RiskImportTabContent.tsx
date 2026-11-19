import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useEffect, useRef, useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { api } from 'core/services/apiClient';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { PsychosocialComplement } from './PsychosocialComplement';

type Option = { id: string; name: string; severity?: number };
type Row = {
  line: number;
  sector: string;
  factor: string;
  method: string;
  favorablePercent: number;
  probability: number;
  severity?: number;
  document: string;
  page: number;
  sectorId?: string;
  riskId?: string;
  sectorName?: string;
  riskName?: string;
  status: string;
  errors: string[];
};
type Preview = {
  previewHash: string;
  canImport: boolean;
  sectors: Option[];
  factors: Option[];
  rows: Row[];
  workspace: Option;
};
type ImportReport = {
  id: string;
  title?: string;
  importedAt: string;
  count: number;
  workspaceName: string;
  rule?: string;
  rows: {
    sector: string;
    sectorName: string;
    factor: string;
    riskName: string;
    favorablePercent: number;
    probability: number;
    severity: number;
    label: string | null;
    level: number | null;
    document: string;
    page: number;
    riskFactorDataId: string;
  }[];
};
const message = (error: unknown) => {
  const data = (
    error as { response?: { data?: { message?: string | string[] } } }
  )?.response?.data?.message;
  return Array.isArray(data)
    ? data.join(' ')
    : data || 'Não foi possível concluir. Tente novamente.';
};

export function RiskImportTabContent({
  workspaceId,
  queryEnabled = true,
}: {
  workspaceId?: string;
  queryEnabled?: boolean;
}) {
  const { companyId } = useGetCompanyId();
  const queryClient = useQueryClient();
  const [file, setFile] = useState<{ name: string; base64: string }>();
  const [preview, setPreview] = useState<Preview>();
  const [sectors, setSectors] = useState<Record<string, string>>({});
  const [factors, setFactors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [reports, setReports] = useState<ImportReport[]>();
  const generation = useRef(0);
  const input = useRef<HTMLInputElement>(null);
  const hasUnsavedPreview = !!preview;
  useEffect(() => {
    if (!hasUnsavedPreview) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [hasUnsavedPreview]);
  useEffect(() => {
    generation.current++;
    setFile(undefined);
    setPreview(undefined);
    setSectors({});
    setFactors({});
    setError('');
    setSuccess('');
    setConfirmed(false);
    setBusy(false);
    setDirty(false);
    setReports(undefined);
    if (input.current) input.current.value = '';
    return () => {
      generation.current++;
    };
  }, [companyId, workspaceId]);

  async function readFile(selected?: File) {
    const current = ++generation.current;
    setPreview(undefined);
    setFile(undefined);
    setSectors({});
    setFactors({});
    setError('');
    setSuccess('');
    setConfirmed(false);
    setDirty(false);
    if (!selected) return;
    if (!/\.xlsx$/i.test(selected.name) || selected.size > 2_000_000) {
      setError('Selecione um arquivo .xlsx de até 2 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (current === generation.current)
        setFile({
          name: selected.name,
          base64: String(reader.result).split(',')[1],
        });
    };
    reader.onerror = () => {
      if (current === generation.current)
        setError('Não foi possível ler o arquivo.');
    };
    reader.readAsDataURL(selected);
  }

  async function review() {
    if (!file || !workspaceId || !companyId) return;
    const current = ++generation.current;
    setBusy(true);
    setError('');
    setSuccess('');
    setConfirmed(false);
    try {
      const { data } = await api.post<Preview>(
        `/risk-data/psychosocial-import/${companyId}/preview`,
        { fileBase64: file.base64, workspaceId, sectors, factors },
      );
      if (current !== generation.current) return;
      setPreview(data);
      setDirty(false);
    } catch (error) {
      if (current === generation.current) {
        setError(message(error));
        setPreview(undefined);
      }
    } finally {
      if (current === generation.current) setBusy(false);
    }
  }

  async function commit() {
    if (
      !preview?.canImport ||
      !confirmed ||
      dirty ||
      !file ||
      !workspaceId ||
      !companyId
    )
      return;
    const current = ++generation.current;
    setBusy(true);
    setError('');
    try {
      const { data } = await api.post<{
        imported: number;
        skipped: number;
        psychosocialImportReport?: ImportReport;
      }>(`/risk-data/psychosocial-import/${companyId}/commit`, {
        fileBase64: file.base64,
        workspaceId,
        sectors,
        factors,
        previewHash: preview.previewHash,
      });
      if (current !== generation.current) return;
      setSuccess(
        `${data.imported} avaliações importadas. ${data.skipped} já estavam importadas. A severidade e a matriz utilizadas são as do SimpleSST.`,
      );
      setPreview(undefined);
      setConfirmed(false);
      const savedReport = data.psychosocialImportReport;
      if (savedReport)
        setReports((old) => [
          { ...savedReport, count: savedReport.rows.length },
          ...(old || []).filter((report) => report.id !== savedReport.id),
        ]);
      void queryClient.invalidateQueries();
    } catch (error) {
      if (current === generation.current) {
        setError(message(error));
        setDirty(true);
        setConfirmed(false);
      }
    } finally {
      if (current === generation.current) setBusy(false);
    }
  }

  async function loadHistory() {
    if (!companyId || !workspaceId) return;
    const current = ++generation.current;
    setBusy(true);
    setError('');
    try {
      const savedReports = await api.get<ImportReport[]>(
        `/risk-data/psychosocial-import/${companyId}/reports/${workspaceId}`,
      );
      if (current === generation.current) setReports(savedReports.data);
    } catch (error) {
      if (current === generation.current) setError(message(error));
    } finally {
      if (current === generation.current) setBusy(false);
    }
  }

  async function downloadReport(report: ImportReport) {
    if (!companyId || !workspaceId) return;
    const current = ++generation.current;
    setBusy(true);
    setError('');
    try {
      const { data } = await api.get<Blob>(
        `/risk-data/psychosocial-import/${companyId}/reports/${workspaceId}/${report.id}/pdf`,
        { responseType: 'blob' },
      );
      if (current !== generation.current) return;
      const url = URL.createObjectURL(data),
        link = document.createElement('a');
      link.href = url;
      link.download = `importacao-psicossocial-${report.id}.pdf`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      if (current === generation.current) setError(message(error));
    } finally {
      if (current === generation.current) setBusy(false);
    }
  }

  const mapping = (kind: 'sector' | 'factor', source: string) => {
    if (!preview) return null;
    const options = kind === 'sector' ? preview.sectors : preview.factors;
    const values = kind === 'sector' ? sectors : factors;
    const sample = preview.rows.find(
      (row) => (kind === 'sector' ? row.sector : row.factor) === source,
    )!;
    const id = Object.prototype.hasOwnProperty.call(values, source)
      ? values[source]
      : kind === 'sector'
        ? sample.sectorId
        : sample.riskId;
    return (
      <Autocomplete
        key={source}
        fullWidth
        disabled={busy}
        options={options}
        value={options.find((option) => option.id === id) || null}
        getOptionLabel={(option) =>
          `${option.name}${option.severity != null ? ` (severidade ${option.severity})` : ''}`
        }
        isOptionEqualToValue={(a, b) => a.id === b.id}
        onChange={(_, value) => {
          (kind === 'sector' ? setSectors : setFactors)((old) => ({
            ...old,
            [source]: value?.id || '',
          }));
          setDirty(true);
          setConfirmed(false);
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label={source}
            error={!id}
            helperText={
              !id
                ? kind === 'sector'
                  ? 'Vínculo pendente: selecione o setor correspondente no estabelecimento.'
                  : 'Vínculo pendente: selecione o fator psicossocial correspondente no cadastro.'
                : kind === 'sector'
                  ? 'Setor do estabelecimento selecionado'
                  : 'Fator psicossocial do cadastro SimpleSST'
            }
          />
        )}
      />
    );
  };

  return (
    <Stack
      spacing={12}
      sx={(theme) => ({
        p: '24px',
        color: 'text.primary',
        ...(theme.palette.mode === 'dark' && {
          '& .MuiTypography-root, & .MuiTableCell-root': { color: '#e2e8f0' },
          '& .MuiInputLabel-root, & .MuiFormHelperText-root': {
            color: '#cbd5e1',
          },
          '& .MuiInputLabel-root.Mui-focused': { color: '#f8fafc' },
          '& .MuiInputLabel-root.Mui-error, & .MuiFormHelperText-root.Mui-error':
            { color: '#ff8a80' },
          '& .MuiInputBase-input': { color: '#e2e8f0' },
        }),
      })}
    >
      <Typography variant="h5">
        Importar fatores de riscos psicossociais
      </Typography>
      <Typography color="text.secondary">
        Importe uma avaliação externa HSE-SIT por setor. O percentual favorável
        determina a probabilidade. O nível de risco é calculado com a severidade
        e a matriz do SimpleSST.
      </Typography>
      <Alert severity="info">
        Faixas do relatório: 90 a 100 → P1; 75 a menos de 90 → P2; 60 a menos de
        75 → P3; 40 a menos de 60 → P4; abaixo de 40 → P5. A importação registra
        a origem e não cria respostas nem participantes de formulário.
      </Alert>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={8}>
        <Button
          variant="outlined"
          href="/models/importacao-psicossocial-modelo.xlsx"
          download
        >
          Baixar modelo Excel
        </Button>
        <Button
          variant="outlined"
          component="label"
          disabled={busy || !workspaceId || !queryEnabled}
        >
          Selecionar planilha
          <input
            ref={input}
            hidden
            type="file"
            accept=".xlsx"
            onChange={(event) => void readFile(event.target.files?.[0])}
          />
        </Button>
        <Button
          variant="contained"
          disabled={!file || busy || !workspaceId || !queryEnabled}
          onClick={() => void review()}
        >
          {preview ? 'Atualizar prévia' : 'Conferir planilha'}
        </Button>
        <Button
          variant="text"
          disabled={busy || !workspaceId || !queryEnabled}
          onClick={() => void loadHistory()}
        >
          Consultar avaliações importadas
        </Button>
        {busy && <CircularProgress size={24} />}
      </Stack>
      {!workspaceId && (
        <Alert severity="warning">
          Selecione um estabelecimento no topo da página para importar os
          setores correspondentes.
        </Alert>
      )}
      {file && <Typography>{file.name}</Typography>}
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}
      {reports && (
        <Stack spacing={8}>
          <Typography variant="h6">
            Histórico de importações ({reports.length})
          </Typography>
          <Typography color="text.secondary">
            Cada registro reúne somente as avaliações daquela importação. Os
            dados e o PDF preservam o resultado confirmado naquele momento,
            mesmo após alterações no inventário.
          </Typography>
          {!reports.length && (
            <Typography>
              Nenhuma importação registrada neste estabelecimento.
            </Typography>
          )}
          {reports.map((report) => (
            <Accordion
              key={report.id}
              disableGutters
              sx={{
                border: 1,
                borderColor: 'divider',
                boxShadow: 'none',
                '&:before': { display: 'none' },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`import-report-${report.id}`}
                id={`import-report-header-${report.id}`}
              >
                <Stack
                  spacing={3}
                  sx={{ minWidth: 0, overflowWrap: 'anywhere' }}
                >
                  <Typography fontWeight={600}>
                    {report.title ||
                      [...new Set(report.rows.map((row) => row.document))]
                        .filter(Boolean)
                        .join(' / ') ||
                      'Importação psicossocial externa'}
                  </Typography>
                  <Typography variant="body2">
                    {new Date(report.importedAt).toLocaleString('pt-BR')} —{' '}
                    {report.count} avaliações — {report.workspaceName}
                  </Typography>
                  <Typography variant="caption">
                    Registro: {report.id}
                  </Typography>
                </Stack>
              </AccordionSummary>
              <AccordionDetails id={`import-report-${report.id}`}>
                {companyId && workspaceId && <PsychosocialComplement key={`${companyId}:${workspaceId}:${report.id}`} companyId={companyId} workspaceId={workspaceId} reportId={report.id} />}
                <Stack spacing={8}>
                  <Box>
                    <Button
                      disabled={busy}
                      variant="outlined"
                      onClick={() => void downloadReport(report)}
                    >
                      Baixar PDF para anexar ao PGR
                    </Button>
                  </Box>
                  <TableContainer sx={{ maxHeight: 480 }}>
                    <Table
                      size="small"
                      stickyHeader
                      aria-label={`Avaliações da importação ${report.id}`}
                    >
                      <TableHead>
                        <TableRow>
                          {[
                            'Setor',
                            'Fator',
                            'Favorável (%)',
                            'Probabilidade',
                            'Severidade SimpleSST',
                            'Nível SimpleSST',
                            'Documento de origem',
                          ].map((label) => (
                            <TableCell key={label}>{label}</TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {report.rows.map((row, index) => (
                          <TableRow key={`${row.riskFactorDataId}-${index}`}>
                            <TableCell>{row.sectorName}</TableCell>
                            <TableCell>{row.riskName}</TableCell>
                            <TableCell>
                              {row.favorablePercent.toLocaleString('pt-BR')}
                            </TableCell>
                            <TableCell>{row.probability}</TableCell>
                            <TableCell>{row.severity}</TableCell>
                            <TableCell>
                              {row.label || row.level || 'Não classificado'}
                            </TableCell>
                            <TableCell>
                              {row.document}, p. {row.page}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Stack>
              </AccordionDetails>
            </Accordion>
          ))}
        </Stack>
      )}
      {preview && (
        <>
          <Alert severity="warning">
            Prévia ainda não importada. Atualizar prévia valida os vínculos;
            somente Importar avaliações conferidas grava os resultados.
            Recarregar esta página antes da confirmação descarta as escolhas
            desta prévia.
          </Alert>
          <Typography variant="h6">
            Confira os vínculos — {preview.workspace.name}
          </Typography>
          <Typography color="text.secondary">
            {preview.rows.length} linhas. Avaliações existentes são preservadas.
            Corrija todos os vínculos e atualize a prévia antes de importar.
          </Typography>
          <Alert severity="info">
            Campos vermelhos indicam vínculos pendentes. À esquerda, escolha o
            setor do estabelecimento. À direita, escolha o fator psicossocial
            equivalente no cadastro SimpleSST. Nomes diferentes podem
            corresponder ao mesmo cadastro; confira o significado antes de
            vincular. Depois, clique em Atualizar prévia.
          </Alert>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: '24px',
              alignItems: 'start',
            }}
          >
            <Stack spacing={12}>
              <Typography variant="subtitle1">Setores do relatório</Typography>
              {[...new Set(preview.rows.map((row) => row.sector))].map(
                (source) => mapping('sector', source),
              )}
            </Stack>
            <Stack spacing={12}>
              <Typography variant="subtitle1">Fatores do relatório</Typography>
              {[...new Set(preview.rows.map((row) => row.factor))].map(
                (source) => mapping('factor', source),
              )}
            </Stack>
          </Box>
          {dirty && (
            <Alert severity="warning">
              Os vínculos foram alterados. Clique em Atualizar prévia para
              recalcular e validar.
            </Alert>
          )}
          <TableContainer
            sx={{ maxHeight: 520, border: 1, borderColor: 'divider' }}
          >
            <Table
              size="small"
              stickyHeader
              aria-label="Prévia da importação psicossocial"
            >
              <TableHead>
                <TableRow>
                  {[
                    'Linha',
                    'Setor',
                    'Fator',
                    'Favorável (%)',
                    'Probabilidade',
                    'Severidade SimpleSST',
                    'Origem',
                    'Conferência',
                  ].map((label) => (
                    <TableCell key={label}>{label}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {preview.rows.map((row) => (
                  <TableRow key={row.line}>
                    <TableCell>{row.line}</TableCell>
                    <TableCell>{row.sectorName || row.sector}</TableCell>
                    <TableCell>{row.riskName || row.factor}</TableCell>
                    <TableCell>
                      {row.favorablePercent.toLocaleString('pt-BR')}
                    </TableCell>
                    <TableCell>{row.probability}</TableCell>
                    <TableCell>{row.severity ?? 'Não vinculada'}</TableCell>
                    <TableCell>
                      {row.document}, p. {row.page}
                    </TableCell>
                    <TableCell
                      sx={{
                        color: row.errors.length
                          ? 'error.main'
                          : 'text.primary',
                        minWidth: 180,
                      }}
                    >
                      {row.errors.join(' ') ||
                        (row.status === 'already_imported'
                          ? 'Já importado'
                          : 'Pronto')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <FormControlLabel
            control={
              <Checkbox
                disabled={busy || dirty || !preview.canImport}
                checked={confirmed}
                onChange={(event) => setConfirmed(event.target.checked)}
              />
            }
            label="Conferi o estabelecimento, os setores, os fatores e a regra de probabilidade. Importar com a severidade e a matriz do SimpleSST."
          />
          <Box>
            <Button
              variant="contained"
              disabled={busy || dirty || !confirmed || !preview.canImport}
              onClick={() => void commit()}
            >
              Importar avaliações conferidas
            </Button>
          </Box>
        </>
      )}
    </Stack>
  );
}
