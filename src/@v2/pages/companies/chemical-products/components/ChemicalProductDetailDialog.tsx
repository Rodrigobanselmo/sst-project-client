import { SText } from '@v2/components/atoms/SText/SText';
import { useFetch } from '@v2/hooks/api/useFetch';
import { useMutateChemicalProduct } from '@v2/services/security/characterization/chemical-product/hooks/useMutateChemicalProduct';
import { chemicalProductQueryKeys } from '@v2/services/security/characterization/chemical-product/hooks/chemical-product.query-keys';
import { readChemicalProduct } from '@v2/services/security/characterization/chemical-product/service/chemical-product.service';
import type {
  ChemicalProductDetail,
  ParseFispqResult,
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
  FormControl,
  FormControlLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Stack,
  TextField,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';

import { resolveChemicalDialogClose } from './chemical-dialog-close.util';
import { mapChemicalFispqImportError } from './chemical-fispq-import-error.util';
import {
  buildCompositionCompareRows,
  buildDefaultCompositionDecisions,
  buildLinkedFispqCompositionPayload,
  CompositionCompareKind,
  CompositionCompareRow,
  CompositionRowDecision,
  FispqLinkApplyMode,
  getActiveCompositionIngredients,
  hasUsableExtractedIngredients,
  metadataDiffers,
} from './chemical-fispq-link-composition.util';

type Props = {
  open: boolean;
  onClose: () => void;
  companyId: string;
  workspaceId: string;
  productId: string;
  onEdit?: (product: ChemicalProductDetail) => void;
};

const kindLabel = (kind: CompositionCompareKind): string => {
  if (kind === 'matched') return 'Correspondente';
  if (kind === 'divergent') return 'Divergente';
  if (kind === 'extracted-only') return 'Novo na FISPQ';
  return 'Somente no produto';
};

const kindColor = (
  kind: CompositionCompareKind,
): 'success' | 'warning' | 'info' | 'default' => {
  if (kind === 'matched') return 'success';
  if (kind === 'divergent') return 'warning';
  if (kind === 'extracted-only') return 'info';
  return 'default';
};

const formatConcentration = (side: {
  concentrationKind: string;
  exactPercent: number | null;
  minPercent: number | null;
  maxPercent: number | null;
}): string => {
  if (side.concentrationKind === 'EXACT' && side.exactPercent != null) {
    return `${side.exactPercent}%`;
  }
  if (
    side.concentrationKind === 'RANGE' &&
    side.minPercent != null &&
    side.maxPercent != null
  ) {
    return `${side.minPercent}-${side.maxPercent}%`;
  }
  return side.concentrationKind;
};

export const ChemicalProductDetailDialog = ({
  open,
  onClose,
  companyId,
  workspaceId,
  productId,
  onEdit,
}: Props) => {
  const {
    uploadFispqFile,
    createFispq,
    createComposition,
    parseFispq,
    setVisibility,
    activateFispq,
  } = useMutateChemicalProduct();
  const { data, isLoading, refetch } = useFetch({
    queryKey: [
      ...chemicalProductQueryKeys.read({ companyId, workspaceId, productId }),
    ],
    queryFn: () =>
      readChemicalProduct({ companyId, workspaceId, productId }),
    enabled: open && Boolean(productId),
  });

  const [showLinkFispq, setShowLinkFispq] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parsed, setParsed] = useState<ParseFispqResult | null>(null);
  const [versionLabel, setVersionLabel] = useState('');
  const [issuedAt, setIssuedAt] = useState('');
  const [language, setLanguage] = useState('pt');
  const [applyMode, setApplyMode] =
    useState<FispqLinkApplyMode>('document-only');
  const [decisions, setDecisions] = useState<
    Record<string, CompositionRowDecision>
  >({});
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  const clearDraft = () => {
    setShowLinkFispq(false);
    setFile(null);
    setParsed(null);
    setVersionLabel('');
    setIssuedAt('');
    setLanguage('pt');
    setApplyMode('document-only');
    setDecisions({});
    setError(null);
    setInfo(null);
    setWarning(null);
  };

  const hasDraft =
    showLinkFispq ||
    Boolean(file) ||
    Boolean(parsed) ||
    Boolean(versionLabel.trim()) ||
    Boolean(issuedAt.trim()) ||
    (language || 'pt') !== 'pt';

  const requestClose = (reason: string) => {
    const decision = resolveChemicalDialogClose({
      reason,
      hasDraft,
      userConfirmedDiscard: false,
    });
    if (decision === 'keep-open') return;
    if (decision === 'ask-confirm') {
      const ok = window.confirm(
        'Existem alterações não salvas. Deseja descartá-las?',
      );
      if (!ok) return;
    }
    clearDraft();
    onClose();
  };

  const currentIngredients = useMemo(
    () =>
      getActiveCompositionIngredients({
        compositionVersions: data?.compositionVersions,
      }),
    [data?.compositionVersions],
  );

  const compareRows: CompositionCompareRow[] = useMemo(() => {
    if (!parsed?.preview?.ingredients?.length) return [];
    return buildCompositionCompareRows({
      currentIngredients,
      extractedIngredients: parsed.preview.ingredients,
    });
  }, [currentIngredients, parsed]);

  const canUpdateComposition = hasUsableExtractedIngredients(
    parsed?.preview?.ingredients,
  );

  useEffect(() => {
    if (!canUpdateComposition && applyMode === 'document-and-composition') {
      setApplyMode('document-only');
    }
  }, [canUpdateComposition, applyMode]);

  useEffect(() => {
    setDecisions(buildDefaultCompositionDecisions(compareRows));
  }, [compareRows]);

  const tradeNameDiffers = metadataDiffers({
    current: data?.tradeName,
    extracted: parsed?.preview?.tradeName,
  });
  const manufacturerDiffers = metadataDiffers({
    current: data?.manufacturer,
    extracted: parsed?.preview?.manufacturer,
  });

  const handleSelectFile = async (next: File | null) => {
    setFile(next);
    setParsed(null);
    setError(null);
    setInfo(null);
    setWarning(null);
    setApplyMode('document-only');
    setDecisions({});
    if (!next) return;
    try {
      const result = await parseFispq.mutateAsync({
        companyId,
        workspaceId,
        file: next,
      });
      setParsed(result);
      if (result.preview?.versionLabel) {
        setVersionLabel(result.preview.versionLabel);
      }
      if (result.preview?.issuedAt) {
        setIssuedAt(result.preview.issuedAt);
      }
      if (result.preview?.language) {
        setLanguage(result.preview.language);
      }
      if (!result.extractable) {
        setInfo(
          result.message ||
            'Não foi possível extrair texto deste PDF. Você ainda pode vincular somente o documento.',
        );
      } else if (
        !hasUsableExtractedIngredients(result.preview?.ingredients)
      ) {
        setInfo(
          'Nenhum componente utilizável foi encontrado. O documento poderá ser vinculado sem alterar a composição.',
        );
      } else {
        setInfo(
          'Preview pronto. Revise as opções e confirme. Nada foi gravado ainda.',
        );
      }
    } catch (err) {
      setError(mapChemicalFispqImportError(err));
    }
  };

  const setRowDecision = (
    rowId: string,
    decision: CompositionRowDecision,
  ) => {
    setDecisions((current) => ({ ...current, [rowId]: decision }));
  };

  const handleConfirmLink = async () => {
    const fileId = parsed?.fileId;
    if (!fileId && !file) return;
    setError(null);
    setWarning(null);
    setInfo(null);

    let documentId: string | null = null;
    try {
      let resolvedFileId = fileId;
      if (!resolvedFileId && file) {
        const uploaded = await uploadFispqFile.mutateAsync({
          companyId,
          workspaceId,
          file,
        });
        resolvedFileId = uploaded.fileId;
      }
      if (!resolvedFileId) {
        setError('Selecione um PDF para vincular a FISPQ.');
        return;
      }

      const document = await createFispq.mutateAsync({
        companyId,
        workspaceId,
        productId,
        fileId: resolvedFileId,
        versionLabel: versionLabel || null,
        issuedAt: issuedAt || null,
        language: language || null,
        activate: true,
      });
      documentId = document?.id || null;

      if (applyMode === 'document-and-composition') {
        if (!canUpdateComposition) {
          clearDraft();
          setWarning(
            'A FISPQ foi vinculada, mas a composição não foi atualizada: não há componentes utilizáveis no preview.',
          );
          await refetch();
          return;
        }

        const ingredients = buildLinkedFispqCompositionPayload({
          mode: applyMode,
          rows: compareRows,
          decisions,
        });

        if (!ingredients.length) {
          clearDraft();
          setWarning(
            'A FISPQ foi vinculada, mas a composição não foi atualizada: as decisões resultaram em lista vazia.',
          );
          await refetch();
          return;
        }

        try {
          await createComposition.mutateAsync({
            companyId,
            workspaceId,
            productId,
            sourceType: 'FISPQ',
            sourceDocumentId: documentId,
            ingredients,
          });
        } catch (compositionErr) {
          clearDraft();
          setWarning(
            `A FISPQ foi vinculada ao produto (documento ACTIVE), mas a composição não foi atualizada: ${mapChemicalFispqImportError(
              compositionErr,
            )}`,
          );
          await refetch();
          return;
        }
      }

      const successMessage =
        applyMode === 'document-and-composition'
          ? 'FISPQ vinculada e nova composição criada. A anterior ficou SUPERSEDED.'
          : 'FISPQ vinculada. A anterior ficou SUPERSEDED. A composição do produto não foi alterada.';
      clearDraft();
      setInfo(successMessage);
      await refetch();
    } catch (err) {
      setError(mapChemicalFispqImportError(err));
    }
  };

  const documents = data?.documents || [];
  const activeFispq =
    documents.find((doc) => doc.status === 'ACTIVE') || null;
  const history = documents.filter((doc) => doc.status !== 'ACTIVE');
  const busy =
    uploadFispqFile.isPending ||
    createFispq.isPending ||
    createComposition.isPending ||
    parseFispq.isPending;

  const renderDecisionControls = (row: CompositionCompareRow) => {
    const value = decisions[row.id] ?? row.defaultDecision;
    if (row.kind === 'matched' || row.kind === 'divergent') {
      return (
        <FormControl size="small" sx={{ minWidth: 220 }}>
          <Select
            value={value}
            onChange={(e) =>
              setRowDecision(row.id, e.target.value as CompositionRowDecision)
            }
          >
            <MenuItem value="keep-current">Manter atual</MenuItem>
            <MenuItem value="apply-extracted">Aplicar dados da FISPQ</MenuItem>
          </Select>
        </FormControl>
      );
    }
    if (row.kind === 'extracted-only') {
      return (
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <Select
            value={value}
            onChange={(e) =>
              setRowDecision(row.id, e.target.value as CompositionRowDecision)
            }
          >
            <MenuItem value="add">Adicionar</MenuItem>
            <MenuItem value="ignore">Ignorar</MenuItem>
          </Select>
        </FormControl>
      );
    }
    return (
      <FormControl size="small" sx={{ minWidth: 220 }}>
        <Select
          value={value}
          onChange={(e) =>
            setRowDecision(row.id, e.target.value as CompositionRowDecision)
          }
        >
          <MenuItem value="keep">Manter</MenuItem>
          <MenuItem value="remove">Remover da nova composição</MenuItem>
        </Select>
      </FormControl>
    );
  };

  return (
    <Dialog
      open={open}
      disableEscapeKeyDown={hasDraft}
      onClose={(_event, reason) => requestClose(reason)}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
        },
        onMouseDown: (event) => event.stopPropagation(),
      }}
    >
      <DialogTitle>Produto químico</DialogTitle>
      <DialogContent sx={{ overflowY: 'auto', flex: 1, minHeight: 0 }}>
        {isLoading || !data ? (
          <SText>Carregando…</SText>
        ) : (
          <Stack spacing={2} mt={1}>
            <SText fontWeight={700}>{data.tradeName}</SText>
            <SText fontSize={13} color="text.secondary">
              {data.isPureSubstance ? 'Produto puro' : 'Mistura'}
              {data.manufacturer ? ` · ${data.manufacturer}` : ''}
            </SText>

            {(data.compositionWarnings || []).length ? (
              <Alert severity="warning">
                {(data.compositionWarnings || []).join('\n')}
              </Alert>
            ) : null}

            <SText fontWeight={600}>Composição vigente</SText>
            {(data.compositionVersions || [])
              .filter((version) => version.status === 'ACTIVE')
              .flatMap((version) =>
                version.ingredients.map((ingredient) => (
                  <SText key={ingredient.id} fontSize={13}>
                    {ingredient.chemicalName}
                    {ingredient.cas ? ` · CAS ${ingredient.cas}` : ''}
                    {' · '}
                    {ingredient.concentrationKind}
                    {ingredient.exactPercent != null
                      ? ` ${ingredient.exactPercent}%`
                      : ''}
                    {ingredient.minPercent != null &&
                    ingredient.maxPercent != null
                      ? ` ${ingredient.minPercent}-${ingredient.maxPercent}%`
                      : ''}
                    {ingredient.riskFactor
                      ? ` → ${ingredient.riskFactor.name}`
                      : ' → sem fator'}
                  </SText>
                )),
              )}

            <Box
              sx={{
                p: 2,
                border: '2px solid',
                borderColor: 'primary.main',
                borderRadius: 1,
                bgcolor: 'action.hover',
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={1.5}
                gap={1}
                flexWrap="wrap"
              >
                <SText fontWeight={800} fontSize={16}>
                  FISPQ e versões
                </SText>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setShowLinkFispq(true)}
                >
                  Vincular / Nova versão da FISPQ
                </Button>
              </Stack>

              {activeFispq ? (
                <Stack spacing={1} mb={2}>
                  <SText fontWeight={600}>FISPQ vigente</SText>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Chip size="small" color="primary" label={activeFispq.status} />
                    <Chip
                      size="small"
                      label={`Versão: ${activeFispq.versionLabel || 'sem versão'}`}
                    />
                    <Chip
                      size="small"
                      label={`Data: ${
                        activeFispq.issuedAt
                          ? String(activeFispq.issuedAt).slice(0, 10)
                          : '—'
                      }`}
                    />
                    <Chip
                      size="small"
                      label={`Idioma: ${activeFispq.language || '—'}`}
                    />
                    {activeFispq.publishedForEmployees ? (
                      <Chip size="small" color="success" label="Publicada p/ empregados" />
                    ) : (
                      <Chip size="small" label="Não publicada p/ empregados" />
                    )}
                  </Stack>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    <Button
                      size="small"
                      variant="outlined"
                      href={activeFispq.file.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Abrir PDF
                    </Button>
                    <Button
                      size="small"
                      onClick={() =>
                        setVisibility
                          .mutateAsync({
                            companyId,
                            workspaceId,
                            productId,
                            documentId: activeFispq.id,
                            publishedForEmployees:
                              !activeFispq.publishedForEmployees,
                          })
                          .then(() => refetch())
                      }
                    >
                      {activeFispq.publishedForEmployees
                        ? 'Retirar dos empregados'
                        : 'Disponibilizar aos empregados'}
                    </Button>
                  </Stack>
                </Stack>
              ) : (
                <Alert severity="info" sx={{ mb: 2 }}>
                  Nenhuma FISPQ vigente. Use “Vincular / Nova versão da FISPQ”
                  para anexar.
                </Alert>
              )}

              <SText fontWeight={600} mb={1}>
                Histórico
              </SText>
              {history.length ? (
                history.map((doc) => (
                  <Stack
                    key={doc.id}
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    flexWrap="wrap"
                    mb={0.5}
                  >
                    <Chip size="small" label={doc.status} />
                    <SText fontSize={13}>
                      {doc.versionLabel || 'sem versão'}
                      {doc.issuedAt
                        ? ` · ${String(doc.issuedAt).slice(0, 10)}`
                        : ''}
                      {doc.language ? ` · ${doc.language}` : ''}
                    </SText>
                    <Button
                      size="small"
                      href={doc.file.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Abrir PDF
                    </Button>
                    {doc.status !== 'ARCHIVED' ? (
                      <Button
                        size="small"
                        onClick={() =>
                          activateFispq
                            .mutateAsync({
                              companyId,
                              workspaceId,
                              productId,
                              documentId: doc.id,
                            })
                            .then(() => refetch())
                        }
                      >
                        Tornar vigente
                      </Button>
                    ) : null}
                  </Stack>
                ))
              ) : (
                <SText fontSize={13} color="text.secondary">
                  Sem versões anteriores.
                </SText>
              )}

              {showLinkFispq ? (
                <Box
                  mt={2}
                  p={1.5}
                  border="1px dashed"
                  borderColor="divider"
                  borderRadius={1}
                >
                  <SText fontWeight={700} mb={1}>
                    Vincular / Nova versão da FISPQ
                  </SText>
                  <Alert severity="warning" sx={{ mb: 1.5 }}>
                    Ao confirmar, a nova FISPQ ficará ACTIVE e a anterior
                    SUPERSEDED. Se a anterior estiver publicada para empregados,
                    essa publicação será desativada; será necessário republicar a
                    nova versão pelo fluxo existente. Nome comercial e fabricante
                    do produto não serão alterados.
                  </Alert>

                  <Stack spacing={1.5}>
                    <Button variant="outlined" component="label" disabled={busy}>
                      {parseFispq.isPending
                        ? 'Extraindo…'
                        : 'Selecionar PDF'}
                      <input
                        hidden
                        type="file"
                        accept="application/pdf,.pdf"
                        onChange={(e) =>
                          handleSelectFile(e.target.files?.[0] || null)
                        }
                      />
                    </Button>

                    {parsed || file ? (
                      <SText fontSize={13}>
                        Arquivo: {parsed?.fileName || file?.name}
                        {parsed?.extractable
                          ? ` · ${parsed.preview?.ingredients?.length || 0} componente(s) lidos`
                          : ''}
                      </SText>
                    ) : null}

                    {parsed ? (
                      <Box
                        p={1.25}
                        border="1px solid"
                        borderColor="divider"
                        borderRadius={1}
                        bgcolor="background.paper"
                      >
                        <SText fontWeight={600} mb={1}>
                          Comparação geral
                        </SText>
                        <SText fontSize={13}>
                          Nome comercial atual:{' '}
                          <strong>{data.tradeName || '—'}</strong>
                        </SText>
                        <SText fontSize={13}>
                          Nome comercial extraído:{' '}
                          <strong>
                            {parsed.preview?.tradeName || '—'}
                          </strong>
                        </SText>
                        <SText fontSize={13} mt={1}>
                          Fabricante atual:{' '}
                          <strong>{data.manufacturer || '—'}</strong>
                        </SText>
                        <SText fontSize={13}>
                          Fabricante extraído:{' '}
                          <strong>
                            {parsed.preview?.manufacturer || '—'}
                          </strong>
                        </SText>
                        {tradeNameDiffers || manufacturerDiffers ? (
                          <Alert severity="warning" sx={{ mt: 1 }}>
                            Há divergência de nome comercial e/ou fabricante. O
                            vínculo da FISPQ não altera esses metadados do
                            produto.
                          </Alert>
                        ) : null}
                      </Box>
                    ) : null}

                    <TextField
                      size="small"
                      label="Versão"
                      value={versionLabel}
                      onChange={(e) => setVersionLabel(e.target.value)}
                    />
                    <TextField
                      size="small"
                      type="date"
                      label="Data da FISPQ"
                      InputLabelProps={{ shrink: true }}
                      value={issuedAt}
                      onChange={(e) => setIssuedAt(e.target.value)}
                    />
                    <TextField
                      size="small"
                      label="Idioma"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                    />

                    <FormControl>
                      <SText fontWeight={600} mb={0.5}>
                        Modo de aplicação
                      </SText>
                      <RadioGroup
                        value={applyMode}
                        onChange={(_, value) =>
                          setApplyMode(value as FispqLinkApplyMode)
                        }
                      >
                        <FormControlLabel
                          value="document-only"
                          control={<Radio />}
                          label="Vincular somente a FISPQ"
                        />
                        <FormControlLabel
                          value="document-and-composition"
                          control={<Radio />}
                          disabled={!canUpdateComposition}
                          label="Vincular FISPQ e atualizar composição"
                        />
                      </RadioGroup>
                      {!canUpdateComposition && parsed ? (
                        <Alert severity="info" sx={{ mt: 0.5 }}>
                          Atualização de composição desabilitada: não há
                          componentes utilizáveis no preview.
                        </Alert>
                      ) : null}
                    </FormControl>

                    {applyMode === 'document-and-composition' &&
                    compareRows.length ? (
                      <Stack spacing={1.25}>
                        <SText fontWeight={600}>
                          Comparação dos componentes
                        </SText>
                        <Alert severity="info">
                          Defaults seguros: correspondentes mantêm o atual;
                          novos da FISPQ são ignorados; exclusivos do produto
                          são mantidos. Remoção só ocorre por decisão explícita.
                        </Alert>
                        {compareRows.map((row) => (
                          <Box
                            key={row.id}
                            p={1.25}
                            border="1px solid"
                            borderColor="divider"
                            borderRadius={1}
                            bgcolor="background.paper"
                          >
                            <Stack
                              direction="row"
                              spacing={1}
                              alignItems="center"
                              mb={1}
                              flexWrap="wrap"
                              useFlexGap
                            >
                              <Chip
                                size="small"
                                color={kindColor(row.kind)}
                                label={kindLabel(row.kind)}
                              />
                              {row.canPreserveRiskFactor ? (
                                <Chip
                                  size="small"
                                  variant="outlined"
                                  label="Preserva fator ao aplicar FISPQ"
                                />
                              ) : null}
                            </Stack>
                            <Stack
                              direction={{ xs: 'column', sm: 'row' }}
                              spacing={1.5}
                              mb={1}
                            >
                              <Box flex={1}>
                                <SText fontSize={12} color="text.secondary">
                                  Atual
                                </SText>
                                {row.current ? (
                                  <SText fontSize={13}>
                                    {row.current.chemicalName || '—'}
                                    {row.current.cas
                                      ? ` · CAS ${row.current.cas}`
                                      : ' · Sem CAS'}
                                    {' · '}
                                    {formatConcentration(row.current)}
                                    {' · '}
                                    {row.current.riskFactorName
                                      ? `RF: ${row.current.riskFactorName}`
                                      : 'Sem RF'}
                                  </SText>
                                ) : (
                                  <SText fontSize={13} color="text.secondary">
                                    —
                                  </SText>
                                )}
                              </Box>
                              <Box flex={1}>
                                <SText fontSize={12} color="text.secondary">
                                  Extraído
                                </SText>
                                {row.extracted ? (
                                  <SText fontSize={13}>
                                    {row.extracted.chemicalName || '—'}
                                    {row.extracted.cas
                                      ? ` · CAS ${row.extracted.cas}`
                                      : ' · Sem CAS'}
                                    {' · '}
                                    {formatConcentration(row.extracted)}
                                  </SText>
                                ) : (
                                  <SText fontSize={13} color="text.secondary">
                                    —
                                  </SText>
                                )}
                              </Box>
                            </Stack>
                            {renderDecisionControls(row)}
                          </Box>
                        ))}
                      </Stack>
                    ) : null}

                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      <Button
                        variant="contained"
                        disabled={(!parsed && !file) || busy}
                        onClick={handleConfirmLink}
                      >
                        {busy ? 'Salvando…' : 'Confirmar vínculo'}
                      </Button>
                      <Button
                        onClick={() => {
                          setShowLinkFispq(false);
                          setFile(null);
                          setParsed(null);
                          setDecisions({});
                          setApplyMode('document-only');
                          setError(null);
                          setWarning(null);
                          setInfo(null);
                        }}
                        disabled={busy}
                      >
                        Cancelar
                      </Button>
                    </Stack>
                  </Stack>
                </Box>
              ) : null}
            </Box>

            {info ? <Alert severity="info">{info}</Alert> : null}
            {warning ? <Alert severity="warning">{warning}</Alert> : null}
            {error ? <Alert severity="error">{error}</Alert> : null}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        {data && onEdit ? (
          <Button
            onClick={() => onEdit(data as ChemicalProductDetail)}
            variant="outlined"
          >
            Editar produto
          </Button>
        ) : null}
        <Button onClick={() => requestClose('closeButton')}>Fechar</Button>
      </DialogActions>
    </Dialog>
  );
};
