import { SText } from '@v2/components/atoms/SText/SText';
import {
  downloadChemicalExcelValidateCorrected,
  previewChemicalExcelValidate,
} from '@v2/services/security/characterization/chemical-product/service/chemical-product.service';
import type { ChemicalValidatePreviewResult } from '@v2/services/security/characterization/chemical-product/service/chemical-product.types';
import {
  Alert,
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
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { useState } from 'react';

import { resolveChemicalDialogClose } from './chemical-dialog-close.util';
import { shouldShowCorrectedWorkbookDownload } from './chemical-validate-ui.util';

type Props = {
  open: boolean;
  onClose: () => void;
  companyId: string;
  workspaceId: string;
};

type IssueFilter = 'all' | 'errors' | 'warnings' | 'infos';

const statusColor = (
  status: string,
): 'success' | 'warning' | 'error' | 'info' | 'default' => {
  if (status === 'ACCEPTED' || status === 'CORRECTED') return 'success';
  if (status === 'PENDING') return 'warning';
  if (status === 'CONFLICT' || status === 'ERROR') return 'error';
  return 'default';
};

export const ChemicalExcelValidateDialog = ({
  open,
  onClose,
  companyId,
  workspaceId,
}: Props) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ChemicalValidatePreviewResult | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [issueFilter, setIssueFilter] = useState<IssueFilter>('all');

  const hasDraft = Boolean(file) || Boolean(preview);

  const clear = () => {
    setFile(null);
    setPreview(null);
    setError(null);
    setBusy(false);
    setIssueFilter('all');
  };

  const requestClose = (reason: string) => {
    const decision = resolveChemicalDialogClose({
      reason,
      hasDraft,
      userConfirmedDiscard: false,
    });
    if (decision === 'keep-open') return;
    if (decision === 'ask-confirm') {
      const ok = window.confirm(
        'Descartar a validação? Nada foi gravado no inventário.',
      );
      if (!ok) return;
    }
    clear();
    onClose();
  };

  const handleFile = async (next: File | null) => {
    setFile(next);
    setPreview(null);
    setError(null);
    if (!next) return;
    if (!next.name.toLowerCase().endsWith('.xlsx')) {
      setError('Aceito apenas arquivo .xlsx.');
      return;
    }
    setBusy(true);
    try {
      const result = await previewChemicalExcelValidate({
        companyId,
        workspaceId,
        file: next,
      });
      setPreview(result);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Não foi possível validar a planilha preparada.',
      );
    } finally {
      setBusy(false);
    }
  };

  const issues = (preview?.issues || []).filter((issue) => {
    if (issueFilter === 'errors') return issue.severity === 'ERROR';
    if (issueFilter === 'warnings') return issue.severity === 'WARNING';
    if (issueFilter === 'infos') return issue.severity === 'INFO';
    return true;
  });

  const showCorrectedDownload = shouldShowCorrectedWorkbookDownload(preview);

  const handleDownloadCorrected = async () => {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      await downloadChemicalExcelValidateCorrected({
        companyId,
        workspaceId,
        file,
      });
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Não foi possível baixar a planilha corrigida.',
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog
      open={open}
      disableEscapeKeyDown={hasDraft}
      onClose={(_event, reason) => requestClose(reason)}
      fullWidth
      maxWidth="lg"
      PaperProps={{
        sx: { maxHeight: '92vh', display: 'flex', flexDirection: 'column' },
        onMouseDown: (event) => event.stopPropagation(),
      }}
    >
      <DialogTitle>Validar planilha preparada</DialogTitle>
      <DialogContent sx={{ overflowY: 'auto', flex: 1 }}>
        <Stack spacing={2} mt={1}>
          <SText fontSize={13} color="text.secondary">
            Envie a planilha já curada no Excel. O SimpleSST reprocessa a
            correspondência (incluindo CAS preenchidos manualmente), aplica só
            correções seguras de formatação e mostra erros, avisos e o que está
            pronto para importar. Nada é gravado nesta etapa.
          </SText>

          <Button variant="outlined" component="label" disabled={busy}>
            Selecionar planilha preparada .xlsx
            <input
              hidden
              type="file"
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={(e) => handleFile(e.target.files?.[0] || null)}
            />
          </Button>
          {file ? <SText fontSize={13}>Arquivo: {file.name}</SText> : null}

          {preview ? (
            <>
              <Alert severity={preview.persisted ? 'error' : 'info'}>
                Preview sem persistência · aba lida: {preview.sourceSheet}
                {preview.canProceedHint
                  ? ' · há componentes prontos para importar após revisão'
                  : ''}
              </Alert>

              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip label={`Componentes: ${preview.summary.components}`} />
                <Chip label={`Produtos: ${preview.summary.products}`} />
                <Chip
                  color="success"
                  label={`CAS: ${preview.summary.autoLinkedByCas}`}
                />
                <Chip
                  color="success"
                  label={`Nome: ${preview.summary.autoLinkedByExactName}`}
                />
                <Chip
                  color="success"
                  label={`Sinônimo: ${preview.summary.autoLinkedBySynonym}`}
                />
                <Chip
                  color="warning"
                  label={`Revisão: ${preview.summary.reviewRequired}`}
                />
                <Chip label={`Sem correspondência: ${preview.summary.noMatch}`} />
                <Chip
                  color="info"
                  label={`CAS do usuário: ${preview.summary.userAddedCas}`}
                />
                <Chip
                  color="error"
                  label={`CAS inválidos: ${preview.summary.invalidCas}`}
                />
                <Chip
                  color="error"
                  label={`Conflitos: ${preview.summary.conflicts}`}
                />
                <Chip
                  color="success"
                  label={`Prontos: ${preview.summary.readyToImport}`}
                />
                <Chip color="error" label={`Erros: ${preview.summary.errors}`} />
                <Chip
                  color="warning"
                  label={`Avisos: ${preview.summary.warnings}`}
                />
                <Chip label={`Infos: ${preview.summary.infos}`} />
                {(preview.summary.safeCasConsolidations || 0) > 0 ? (
                  <Chip
                    color="info"
                    label={`Consolidações seguras: ${preview.summary.safeCasConsolidations}`}
                  />
                ) : null}
              </Stack>

              {showCorrectedDownload && preview.consolidations?.length ? (
                <Alert severity="info">
                  Foram detectadas {preview.consolidations.length} consolidação(ões)
                  segura(s) de CAS duplicado no mesmo produto. Baixe a planilha
                  corrigida para remover as duplicidades importáveis sem refazer a
                  curadoria.
                  <Box component="ul" sx={{ mt: 1, mb: 0, pl: 2 }}>
                    {preview.consolidations.map((item) => (
                      <li key={`${item.productKey}-${item.cas}-${item.survivorRow}`}>
                        {item.tradeName}: CAS {item.cas} — mantém linha{' '}
                        {item.survivorRow}, absorve {item.absorbedRows.join(', ')}
                        {item.aliases.length
                          ? ` (aliases: ${item.aliases.join('; ')})`
                          : ''}
                      </li>
                    ))}
                  </Box>
                </Alert>
              ) : null}

              <ToggleButtonGroup
                exclusive
                size="small"
                value={issueFilter}
                onChange={(_, value) => value && setIssueFilter(value)}
              >
                <ToggleButton value="all">Todos</ToggleButton>
                <ToggleButton value="errors">ERRO</ToggleButton>
                <ToggleButton value="warnings">AVISO</ToggleButton>
                <ToggleButton value="infos">INFORMAÇÃO</ToggleButton>
              </ToggleButtonGroup>

              <Box sx={{ overflowX: 'auto' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Severidade</TableCell>
                      <TableCell>Linha</TableCell>
                      <TableCell>Campo</TableCell>
                      <TableCell>Mensagem</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {issues.map((issue, index) => (
                      <TableRow key={`${issue.code}-${index}`}>
                        <TableCell>{issue.severity}</TableCell>
                        <TableCell>{issue.row ?? '—'}</TableCell>
                        <TableCell>{issue.field ?? '—'}</TableCell>
                        <TableCell>{issue.message}</TableCell>
                      </TableRow>
                    ))}
                    {!issues.length ? (
                      <TableRow>
                        <TableCell colSpan={4}>
                          Nenhum item no filtro atual.
                        </TableCell>
                      </TableRow>
                    ) : null}
                  </TableBody>
                </Table>
              </Box>

              <SText fontWeight={600}>Componentes</SText>
              <Stack spacing={1}>
                {preview.components.map((component) => (
                  <Box
                    key={`${component.row}-${component.componentOriginal}`}
                    sx={{
                      p: 1.25,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={1}
                      flexWrap="wrap"
                      useFlexGap
                      mb={0.5}
                    >
                      <Chip
                        size="small"
                        color={statusColor(component.componentStatus)}
                        label={component.situation}
                      />
                      <Chip
                        size="small"
                        variant="outlined"
                        label={`Linha ${component.row}`}
                      />
                      {component.userAddedCas ? (
                        <Chip size="small" color="info" label="CAS do usuário" />
                      ) : null}
                      {component.readyToImport ? (
                        <Chip size="small" color="success" label="Pronto" />
                      ) : null}
                    </Stack>
                    <SText fontSize={13}>
                      {component.tradeName}
                      {component.manufacturer
                        ? ` · ${component.manufacturer}`
                        : ''}
                      {' · '}
                      {component.componentOriginal}
                    </SText>
                    <SText fontSize={12} color="text.secondary">
                      CAS efetivo: {component.casEffective || '—'}
                      {' · '}
                      Oficial: {component.casOfficial || '—'}
                      {' · '}
                      Fator: {component.riskFactorName || component.officialName || '—'}
                      {' · '}
                      Match: {component.matchStatusLabel || '—'}
                    </SText>
                    {component.autoFixes.length ? (
                      <SText fontSize={12} color="text.secondary">
                        Correções: {component.autoFixes.join('; ')}
                      </SText>
                    ) : null}
                  </Box>
                ))}
              </Stack>

              <Alert severity="success">
                Próximo passo: se estiver ok, use “Importar Excel” com a aba
                Importação da planilha curada. Esta validação não importa.
              </Alert>
            </>
          ) : null}

          {error ? <Alert severity="error">{error}</Alert> : null}
        </Stack>
      </DialogContent>
      <DialogActions>
        {showCorrectedDownload ? (
          <Button
            variant="contained"
            onClick={handleDownloadCorrected}
            disabled={busy || !file}
          >
            Baixar planilha corrigida
          </Button>
        ) : null}
        <Button onClick={() => requestClose('closeButton')}>Fechar</Button>
      </DialogActions>
    </Dialog>
  );
};
