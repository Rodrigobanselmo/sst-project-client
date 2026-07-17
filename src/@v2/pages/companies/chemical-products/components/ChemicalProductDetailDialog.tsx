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
  FormControlLabel,
  Stack,
  Switch,
  TextField,
} from '@mui/material';
import { useState } from 'react';

import { resolveChemicalDialogClose } from './chemical-dialog-close.util';
import { mapChemicalFispqImportError } from './chemical-fispq-import-error.util';

type Props = {
  open: boolean;
  onClose: () => void;
  companyId: string;
  workspaceId: string;
  productId: string;
  onEdit?: (product: ChemicalProductDetail) => void;
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

  const [showNewFispq, setShowNewFispq] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parsed, setParsed] = useState<ParseFispqResult | null>(null);
  const [versionLabel, setVersionLabel] = useState('');
  const [issuedAt, setIssuedAt] = useState('');
  const [language, setLanguage] = useState('pt');
  const [alsoNewComposition, setAlsoNewComposition] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const clearDraft = () => {
    setShowNewFispq(false);
    setFile(null);
    setParsed(null);
    setVersionLabel('');
    setIssuedAt('');
    setLanguage('pt');
    setAlsoNewComposition(true);
    setError(null);
    setInfo(null);
  };

  const hasDraft =
    showNewFispq ||
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

  const handleSelectFile = async (next: File | null) => {
    setFile(next);
    setParsed(null);
    setError(null);
    setInfo(null);
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
            'Não foi possível extrair texto deste PDF. Você ainda pode anexar como nova versão documental.',
        );
      } else {
        setInfo(
          'Preview da nova FISPQ pronto. Confirme para tornar vigente (a anterior vira SUPERSEDED).',
        );
      }
    } catch (err) {
      setError(mapChemicalFispqImportError(err));
    }
  };

  const handlePublishNewVersion = async () => {
    const fileId = parsed?.fileId;
    if (!fileId && !file) return;
    setError(null);
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
        setError('Selecione um PDF para criar a nova versão.');
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

      if (
        alsoNewComposition &&
        parsed?.extractable &&
        parsed.preview?.ingredients?.length
      ) {
        await createComposition.mutateAsync({
          companyId,
          workspaceId,
          productId,
          sourceType: 'FISPQ',
          sourceDocumentId: document?.id || null,
          ingredients: parsed.preview.ingredients.map((ingredient, index) => ({
            chemicalName:
              ingredient.chemicalName?.trim() ||
              (ingredient.cas
                ? `Componente pendente (CAS ${ingredient.cas})`
                : `Componente ${index + 1}`),
            cas: ingredient.cas,
            concentrationKind: ingredient.concentrationKind,
            exactPercent: ingredient.exactPercent,
            minPercent: ingredient.minPercent,
            maxPercent: ingredient.maxPercent,
            riskFactorId: ingredient.riskFactorId || null,
            sortOrder: index,
          })),
        });
      }

      clearDraft();
      setInfo(
        'Nova versão documental publicada. A anterior ficou SUPERSEDED; apenas uma permanece ACTIVE.',
      );
      await refetch();
    } catch (err) {
      setError(mapChemicalFispqImportError(err));
    }
  };

  const documents = data?.documents || [];
  const activeFispq =
    documents.find((doc) => doc.status === 'ACTIVE') || null;
  const history = documents.filter((doc) => doc.status !== 'ACTIVE');

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
                  onClick={() => setShowNewFispq(true)}
                >
                  NOVA VERSÃO DA FISPQ
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
                  Nenhuma FISPQ vigente. Use “NOVA VERSÃO DA FISPQ” para anexar.
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

              {showNewFispq ? (
                <Box
                  mt={2}
                  p={1.5}
                  border="1px dashed"
                  borderColor="divider"
                  borderRadius={1}
                >
                  <SText fontWeight={700} mb={1}>
                    Anexar nova versão da FISPQ
                  </SText>
                  <SText fontSize={13} color="text.secondary" mb={1.5}>
                    A nova versão fica ACTIVE e a anterior SUPERSEDED. A
                    composição vigente só muda se você marcar a opção abaixo.
                  </SText>
                  <Stack spacing={1.5}>
                    <Button variant="outlined" component="label">
                      Selecionar PDF
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
                    <FormControlLabel
                      control={
                        <Switch
                          checked={alsoNewComposition}
                          onChange={(_, checked) =>
                            setAlsoNewComposition(checked)
                          }
                          disabled={!parsed?.extractable}
                        />
                      }
                      label="Também criar nova versão de composição a partir do preview"
                    />
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="contained"
                        disabled={
                          (!parsed && !file) ||
                          uploadFispqFile.isPending ||
                          createFispq.isPending ||
                          createComposition.isPending ||
                          parseFispq.isPending
                        }
                        onClick={handlePublishNewVersion}
                      >
                        Confirmar nova versão vigente
                      </Button>
                      <Button onClick={() => setShowNewFispq(false)}>
                        Recolher
                      </Button>
                    </Stack>
                  </Stack>
                </Box>
              ) : null}
            </Box>

            {info ? <Alert severity="info">{info}</Alert> : null}
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
