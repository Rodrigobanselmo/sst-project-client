import { SText } from '@v2/components/atoms/SText/SText';
import { useMutateChemicalProduct } from '@v2/services/security/characterization/chemical-product/hooks/useMutateChemicalProduct';
import { searchChemicalRiskFactors } from '@v2/services/security/characterization/chemical-product/service/chemical-product.service';
import type {
  ChemicalExcelImportPreview,
  ChemicalExcelIngredientDecision,
  ChemicalExcelIngredientOverride,
  ChemicalRiskOption,
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
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { useMemo, useState } from 'react';

import { resolveChemicalDialogClose } from './chemical-dialog-close.util';

type Props = {
  open: boolean;
  onClose: () => void;
  companyId: string;
  workspaceId: string;
};

type IssueFilter = 'all' | 'errors' | 'warnings';

type DecisionState = {
  decision: ChemicalExcelIngredientDecision;
  riskFactorId: string | null;
  riskFactorName: string | null;
  officialCas: string | null;
};

const MATCH_LABEL_FALLBACK: Record<string, string> = {
  AUTO_LINKED_CAS: 'Vinculado por CAS',
  AUTO_LINKED_EXACT_NAME: 'Vinculado por nome exato',
  AUTO_LINKED_SYNONYM: 'Vinculado por sinônimo',
  MATCHED_EQUIVALENCE: 'Equivalência encontrada',
  REVIEW_REQUIRED: 'Revisão necessária',
  NO_MATCH: 'Sem correspondência',
  INVALID_CAS: 'CAS inválido',
};

function matchChipColor(
  status: string,
): 'success' | 'info' | 'warning' | 'default' | 'error' {
  if (status.startsWith('AUTO_LINKED') || status === 'MATCHED_EQUIVALENCE') {
    return 'success';
  }
  if (status === 'REVIEW_REQUIRED' || status === 'INVALID_CAS') return 'warning';
  if (status === 'NO_MATCH') return 'default';
  return 'info';
}

function ingredientKey(groupKey: string, sourceRow: number) {
  return `${groupKey}::${sourceRow}`;
}

export const ChemicalExcelImportDialog = ({
  open,
  onClose,
  companyId,
  workspaceId,
}: Props) => {
  const { previewExcelImport, commitExcelImport } = useMutateChemicalProduct();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ChemicalExcelImportPreview | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [issueFilter, setIssueFilter] = useState<IssueFilter>('all');
  const [decisions, setDecisions] = useState<Record<string, DecisionState>>({});
  const [searchCache, setSearchCache] = useState<
    Record<string, ChemicalRiskOption[]>
  >({});

  const hasDraft = Boolean(file) || Boolean(preview);

  const clear = () => {
    setFile(null);
    setPreview(null);
    setError(null);
    setIssueFilter('all');
    setDecisions({});
    setSearchCache({});
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
        'Existem alterações não salvas na importação Excel. Deseja descartá-las? Nada será gravado.',
      );
      if (!ok) return;
    }
    clear();
    onClose();
  };

  const handleFile = async (next: File | null) => {
    setError(null);
    setPreview(null);
    setDecisions({});
    setFile(next);
    if (!next) return;
    if (!next.name.toLowerCase().endsWith('.xlsx')) {
      setError('Aceito apenas arquivo .xlsx.');
      return;
    }
    try {
      const result = await previewExcelImport.mutateAsync({
        companyId,
        workspaceId,
        file: next,
      });
      setPreview(result);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Não foi possível ler a planilha. Baixe o modelo V2 e tente novamente.',
      );
    }
  };

  const setIngredientDecision = (
    groupKey: string,
    sourceRow: number,
    patch: Partial<DecisionState>,
  ) => {
    const key = ingredientKey(groupKey, sourceRow);
    setDecisions((prev) => ({
      ...prev,
      [key]: {
        decision: prev[key]?.decision || 'AUTO',
        riskFactorId: prev[key]?.riskFactorId ?? null,
        riskFactorName: prev[key]?.riskFactorName ?? null,
        officialCas: prev[key]?.officialCas ?? null,
        ...patch,
      },
    }));
  };

  const overrides = useMemo(() => {
    const list: ChemicalExcelIngredientOverride[] = [];
    Object.entries(decisions).forEach(([key, value]) => {
      if (value.decision === 'AUTO') return;
      const [groupKey, sourceRowRaw] = key.split('::');
      list.push({
        groupKey,
        sourceRow: Number(sourceRowRaw),
        riskFactorId: value.riskFactorId,
        decision: value.decision,
      });
    });
    return list;
  }, [decisions]);

  const handleCommit = async () => {
    if (!file || !preview?.canCommit) return;
    const ok = window.confirm(
      `Confirmar importação de ${preview.totals.products} produto(s) e ${preview.totals.ingredients} componente(s)?\nPossíveis duplicidades serão criadas como novos (sem atualização silenciosa).\nVínculo de fator não é obrigatório.`,
    );
    if (!ok) return;
    try {
      await commitExcelImport.mutateAsync({
        companyId,
        workspaceId,
        file,
        confirmCommit: true,
        decisions: overrides,
      });
      clear();
      onClose();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Falha ao confirmar a importação Excel.',
      );
    }
  };

  const searchRisks = async (groupKey: string, sourceRow: number, search: string) => {
    const key = ingredientKey(groupKey, sourceRow);
    try {
      const options = await searchChemicalRiskFactors({
        companyId,
        workspaceId,
        search,
      });
      setSearchCache((prev) => ({ ...prev, [key]: options }));
    } catch {
      setSearchCache((prev) => ({ ...prev, [key]: [] }));
    }
  };

  const issues = (preview?.issues || []).filter((issue) => {
    if (issueFilter === 'errors') return issue.severity === 'ERROR';
    if (issueFilter === 'warnings') return issue.severity === 'WARNING';
    return true;
  });

  return (
    <Dialog
      open={open}
      disableEscapeKeyDown={hasDraft}
      onClose={(_event, reason) => requestClose(reason)}
      fullWidth
      maxWidth="xl"
      PaperProps={{
        sx: {
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
        },
        onMouseDown: (event) => event.stopPropagation(),
      }}
    >
      <DialogTitle>Importar Excel (TECHNICAL · V2)</DialogTitle>
      <DialogContent sx={{ overflowY: 'auto', flex: 1, minHeight: 0 }}>
        <Stack spacing={2} mt={1}>
          <SText fontSize={13} color="text.secondary">
            Modelo V2: uma linha por componente. Sem CAS, o sistema tenta
            vincular por nome/sinônimo exatos — nunca por similaridade.
            Preview não grava nada.
          </SText>
          <Button variant="outlined" component="label">
            Selecionar planilha .xlsx
            <input
              hidden
              type="file"
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={(e) => handleFile(e.target.files?.[0] || null)}
            />
          </Button>
          {file ? (
            <SText fontSize={13}>
              Arquivo: {file.name}
              {preview ? ` · layout ${preview.layoutVersion}` : ''}
            </SText>
          ) : null}

          {preview ? (
            <>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip label={`Produtos: ${preview.totals.products}`} />
                <Chip label={`Componentes: ${preview.totals.ingredients}`} />
                <Chip
                  color={preview.totals.errors ? 'error' : 'default'}
                  label={`Erros: ${preview.totals.errors}`}
                />
                <Chip color="warning" label={`Avisos: ${preview.totals.warnings}`} />
                <Chip
                  color="success"
                  label={`CAS: ${preview.totals.autoLinkedByCas}`}
                />
                <Chip
                  color="success"
                  label={`Nome: ${preview.totals.autoLinkedByExactName ?? 0}`}
                />
                <Chip
                  color="success"
                  label={`Sinônimo: ${preview.totals.autoLinkedBySynonym ?? 0}`}
                />
                <Chip
                  color="info"
                  label={`Equivalência: ${preview.totals.matchedEquivalence ?? 0}`}
                />
                <Chip
                  color="warning"
                  label={`Revisão: ${preview.totals.reviewRequired ?? 0}`}
                />
                <Chip
                  label={`Sem correspondência: ${preview.totals.noMatch ?? preview.totals.withoutRiskFactor}`}
                />
              </Stack>

              <ToggleButtonGroup
                exclusive
                size="small"
                value={issueFilter}
                onChange={(_, value) => value && setIssueFilter(value)}
              >
                <ToggleButton value="all">Todos</ToggleButton>
                <ToggleButton value="errors">Erros</ToggleButton>
                <ToggleButton value="warnings">Avisos</ToggleButton>
              </ToggleButtonGroup>

              <Box sx={{ overflowX: 'auto' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Severidade</TableCell>
                      <TableCell>Aba</TableCell>
                      <TableCell>Linha</TableCell>
                      <TableCell>Campo</TableCell>
                      <TableCell>Mensagem</TableCell>
                      <TableCell>Ação sugerida</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {issues.map((issue, index) => (
                      <TableRow key={`${issue.code}-${index}`}>
                        <TableCell>{issue.severity}</TableCell>
                        <TableCell>{issue.sheet}</TableCell>
                        <TableCell>{issue.row ?? '—'}</TableCell>
                        <TableCell>{issue.field ?? '—'}</TableCell>
                        <TableCell>{issue.message}</TableCell>
                        <TableCell>{issue.suggestedAction ?? '—'}</TableCell>
                      </TableRow>
                    ))}
                    {!issues.length ? (
                      <TableRow>
                        <TableCell colSpan={6}>
                          Nenhum item no filtro atual.
                        </TableCell>
                      </TableRow>
                    ) : null}
                  </TableBody>
                </Table>
              </Box>

              <SText fontWeight={600}>Preview por produto / componente</SText>
              <Stack spacing={1.5}>
                {preview.products.map((product) => (
                  <Box
                    key={product.groupKey}
                    sx={{
                      p: 1.5,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                    }}
                  >
                    <SText fontWeight={700}>
                      Produto:{' '}
                      {product.tradeNameNormalized || product.tradeNameReceived}
                    </SText>
                    <SText fontSize={13} color="text.secondary">
                      Fabricante: {product.manufacturerNormalized || '—'}
                      {' · '}
                      Linhas: {product.sourceRows.join(', ') || '—'}
                      {' · '}
                      Ação: {product.action}
                      {product.isPureSubstance ? ' · Puro' : ' · Mistura'}
                    </SText>
                    {product.groupingAmbiguous ? (
                      <Alert severity="warning" sx={{ mt: 1 }}>
                        Agrupamento possivelmente ambíguo — revise fabricante.
                      </Alert>
                    ) : null}
                    {product.similarProductName ? (
                      <Alert severity="warning" sx={{ mt: 1 }}>
                        Possível duplicidade com “{product.similarProductName}”.
                      </Alert>
                    ) : null}

                    <Stack spacing={1.25} mt={1.5}>
                      {product.ingredients.map((ingredient) => {
                        const sourceRow = ingredient.sourceRows[0] ?? 0;
                        const key = ingredientKey(product.groupKey, sourceRow);
                        const manual = decisions[key];
                        const needsReview =
                          ingredient.matchStatus === 'REVIEW_REQUIRED' ||
                          ingredient.matchStatus === 'NO_MATCH' ||
                          ingredient.matchStatus === 'INVALID_CAS';
                        const decision = manual?.decision || 'AUTO';
                        const linkedName =
                          decision === 'LEAVE_UNLINKED'
                            ? null
                            : decision === 'MANUAL_LINK'
                              ? manual?.riskFactorName
                              : ingredient.riskFactorName ||
                                ingredient.officialRiskName;
                        const linkedCas =
                          decision === 'LEAVE_UNLINKED'
                            ? null
                            : decision === 'MANUAL_LINK'
                              ? manual?.officialCas
                              : ingredient.officialCas;
                        const candidateOptions = [
                          ...(ingredient.candidates || []).map((c) => ({
                            id: c.riskFactorId,
                            name: c.riskFactorName,
                            cas: c.officialCas,
                            system: true,
                            companyId: '',
                            type: 'QUI',
                          })),
                          ...(searchCache[key] || []),
                        ];
                        const uniqueOptions = Array.from(
                          new Map(candidateOptions.map((o) => [o.id, o])).values(),
                        );

                        return (
                          <Box
                            key={key}
                            sx={{
                              p: 1.25,
                              borderRadius: 1,
                              bgcolor: 'action.hover',
                            }}
                          >
                            <Stack
                              direction="row"
                              spacing={1}
                              flexWrap="wrap"
                              useFlexGap
                              alignItems="center"
                            >
                              <Chip
                                size="small"
                                color={matchChipColor(ingredient.matchStatus)}
                                label={
                                  ingredient.matchStatusLabel ||
                                  MATCH_LABEL_FALLBACK[ingredient.matchStatus] ||
                                  ingredient.matchStatus
                                }
                              />
                              <Chip
                                size="small"
                                variant="outlined"
                                label={`Linha ${sourceRow}`}
                              />
                              {ingredient.confidence != null ? (
                                <Chip
                                  size="small"
                                  variant="outlined"
                                  label={`Confiança ${(ingredient.confidence * 100).toFixed(0)}%`}
                                />
                              ) : null}
                            </Stack>
                            <SText fontSize={13} mt={0.75}>
                              Recebido: <b>{ingredient.chemicalNameReceived}</b>
                              {' · '}
                              Normalizado: {ingredient.chemicalNameNormalized}
                            </SText>
                            <SText fontSize={13} color="text.secondary">
                              CAS recebido: {ingredient.casReceived || ingredient.casNormalized || '—'}
                              {' · '}
                              Fator: {linkedName || 'Sem vínculo'}
                              {' · '}
                              Nome oficial: {ingredient.officialRiskName || '—'}
                              {' · '}
                              CAS oficial: {linkedCas || '—'}
                              {' · '}
                              Decisão:{' '}
                              {decision === 'AUTO'
                                ? 'Automática'
                                : decision === 'MANUAL_LINK'
                                  ? 'Manual'
                                  : 'Sem vínculo'}
                            </SText>

                            {needsReview ? (
                              <Stack spacing={1} mt={1}>
                                <TextField
                                  select
                                  size="small"
                                  label="Decisão"
                                  value={decision}
                                  onChange={(e) => {
                                    const next = e.target
                                      .value as ChemicalExcelIngredientDecision;
                                    if (next === 'AUTO') {
                                      setIngredientDecision(
                                        product.groupKey,
                                        sourceRow,
                                        {
                                          decision: 'AUTO',
                                          riskFactorId: ingredient.riskFactorId,
                                          riskFactorName:
                                            ingredient.riskFactorName,
                                          officialCas: ingredient.officialCas || null,
                                        },
                                      );
                                    } else if (next === 'LEAVE_UNLINKED') {
                                      setIngredientDecision(
                                        product.groupKey,
                                        sourceRow,
                                        {
                                          decision: 'LEAVE_UNLINKED',
                                          riskFactorId: null,
                                          riskFactorName: null,
                                          officialCas: null,
                                        },
                                      );
                                    } else {
                                      setIngredientDecision(
                                        product.groupKey,
                                        sourceRow,
                                        { decision: 'MANUAL_LINK' },
                                      );
                                    }
                                  }}
                                  sx={{ maxWidth: 280 }}
                                >
                                  <MenuItem value="AUTO">
                                    Manter sugestão automática
                                  </MenuItem>
                                  <MenuItem value="MANUAL_LINK">
                                    Selecionar fator
                                  </MenuItem>
                                  <MenuItem value="LEAVE_UNLINKED">
                                    Deixar sem vínculo
                                  </MenuItem>
                                </TextField>

                                {decision === 'MANUAL_LINK' ? (
                                  <Autocomplete
                                    options={uniqueOptions}
                                    getOptionLabel={(option) =>
                                      `${option.name}${option.cas ? ` · ${option.cas}` : ''}`
                                    }
                                    value={
                                      uniqueOptions.find(
                                        (o) => o.id === manual?.riskFactorId,
                                      ) || null
                                    }
                                    onInputChange={(_, value) => {
                                      if (value.trim().length >= 2) {
                                        void searchRisks(
                                          product.groupKey,
                                          sourceRow,
                                          value.trim(),
                                        );
                                      }
                                    }}
                                    onChange={(_, option) => {
                                      setIngredientDecision(
                                        product.groupKey,
                                        sourceRow,
                                        {
                                          decision: 'MANUAL_LINK',
                                          riskFactorId: option?.id || null,
                                          riskFactorName: option?.name || null,
                                          officialCas: option?.cas || null,
                                        },
                                      );
                                    }}
                                    renderInput={(params) => (
                                      <TextField
                                        {...params}
                                        size="small"
                                        label="Buscar / escolher fator"
                                        placeholder="Digite para buscar no catálogo"
                                      />
                                    )}
                                  />
                                ) : null}

                                {(ingredient.candidates || []).length ? (
                                  <SText fontSize={12} color="text.secondary">
                                    Candidatos:{' '}
                                    {(ingredient.candidates || [])
                                      .slice(0, 5)
                                      .map(
                                        (c) =>
                                          `${c.riskFactorName} (${(c.confidence * 100).toFixed(0)}%)`,
                                      )
                                      .join(' · ')}
                                  </SText>
                                ) : null}
                              </Stack>
                            ) : null}
                          </Box>
                        );
                      })}
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </>
          ) : null}

          {error ? <Alert severity="error">{error}</Alert> : null}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => requestClose('closeButton')}>Cancelar</Button>
        <Button
          variant="contained"
          disabled={
            !preview?.canCommit ||
            !file ||
            commitExcelImport.isPending ||
            previewExcelImport.isPending
          }
          onClick={handleCommit}
        >
          Confirmar importação
        </Button>
      </DialogActions>
    </Dialog>
  );
};
