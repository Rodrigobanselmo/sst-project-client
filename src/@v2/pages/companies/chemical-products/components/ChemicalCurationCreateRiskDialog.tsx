import { FC, useMemo, useState } from 'react';

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Link,
  Stack,
  Typography,
} from '@mui/material';
import { RiskEditorFields } from 'components/organisms/modals/ModalAddRisk/components/RiskEditorFields/RiskEditorFields';
import {
  initialAddRiskState,
  useAddRisk,
} from 'components/organisms/modals/ModalAddRisk/hooks/useAddRisk';
import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';
import { useSnackbar } from 'notistack';

import { searchChemicalRiskFactors } from '@v2/services/security/characterization/chemical-product/service/chemical-product.service';
import type {
  ChemicalOccupationalEnrichResult,
  ChemicalOccupationalValue,
  ChemicalRiskOption,
} from '@v2/services/security/characterization/chemical-product/service/chemical-product.types';

import type { ChemicalCurationCreateRiskPrefill } from './chemical-curation-create-risk.util';
import {
  filterRisksWithSameCas,
  isValidCasRn,
  softNormalizeCas,
} from './chemical-curation-create-risk.util';
import {
  resolveChemicalCreateRiskAiSuggestionOptions,
  type ChemicalFispqAiSuggestionContext,
} from './chemical-fispq-ai-suggestion-context.util';

type Props = {
  open: boolean;
  companyId: string;
  workspaceId: string;
  initialData: ChemicalCurationCreateRiskPrefill;
  occupationalEnrich?: ChemicalOccupationalEnrichResult | null;
  occupationalLoading?: boolean;
  onClose: () => void;
  onCreated: (risk: IRiskFactors) => void;
  onSelectExisting?: (risk: ChemicalRiskOption) => void;
  fispqAiContext?: ChemicalFispqAiSuggestionContext | null;
};

export const ChemicalCurationCreateRiskDialog: FC<Props> = ({
  open,
  companyId,
  workspaceId,
  initialData,
  occupationalEnrich = null,
  occupationalLoading = false,
  onClose,
  onCreated,
  onSelectExisting,
  fispqAiContext = null,
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const [duplicateRisks, setDuplicateRisks] = useState<ChemicalRiskOption[]>(
    [],
  );
  const [allowDuplicateCas, setAllowDuplicateCas] = useState(false);
  const [checkingCas, setCheckingCas] = useState(false);

  // Referência estável: useAddRisk sincroniza via useEffect em options.initialData.
  // Objeto inline a cada render → setState em loop → Maximum update depth / tela branca.
  const mergedInitialData = useMemo(
    () => ({
      ...initialAddRiskState,
      ...initialData,
    }),
    [initialData],
  );

  const aiSuggestionOptions = useMemo(
    () => resolveChemicalCreateRiskAiSuggestionOptions(fispqAiContext),
    [fispqAiContext],
  );

  const props = useAddRisk({
    initialData: mergedInitialData,
    disableModalClose: true,
    riskEditorLayout: 'inline',
    keepOpenOnCreateFailure: true,
    suppressCreateSuccessSnackbar: true,
    onCancel: () => {
      setDuplicateRisks([]);
      setAllowDuplicateCas(false);
      onClose();
    },
    aiSuggestionSourceContext: aiSuggestionOptions.sourceContext,
    aiSuggestionKnownDataExtras: aiSuggestionOptions.knownDataExtras,
    beforeCreate: async (payload) => {
      const rawCas = String(payload.cas ?? '').trim();
      if (!rawCas) {
        setDuplicateRisks([]);
        return payload;
      }

      const normalized = softNormalizeCas(rawCas).value;
      if (!isValidCasRn(normalized)) {
        enqueueSnackbar(
          'CAS inválido. Corrija o formato e o dígito verificador antes de salvar.',
          { variant: 'error' },
        );
        return null;
      }

      const nextPayload = { ...payload, cas: normalized };

      if (!allowDuplicateCas) {
        setCheckingCas(true);
        try {
          const results = await searchChemicalRiskFactors({
            companyId,
            workspaceId,
            search: normalized,
          });
          const sameCas = filterRisksWithSameCas(results, normalized);
          if (sameCas.length) {
            setDuplicateRisks(sameCas);
            enqueueSnackbar(
              'Já existe fator visível com o mesmo CAS. Confirme se deseja criar mesmo assim ou selecione o existente.',
              { variant: 'warning' },
            );
            return null;
          }
        } finally {
          setCheckingCas(false);
        }
      }

      setDuplicateRisks([]);
      return nextPayload;
    },
    onSubmitSuccess: (created) => {
      if (!created?.id) return;
      setDuplicateRisks([]);
      setAllowDuplicateCas(false);
      onCreated(created);
    },
  });

  const { riskData, setRiskData, handleSubmit, onSubmit, onCloseUnsaved, loading } =
    props;

  const busy = loading || checkingCas || occupationalLoading;

  const titleNote = useMemo(() => {
    if (!initialData.cas) {
      return 'Revise nome e CAS antes de salvar. O CAS não foi inventado automaticamente.';
    }
    return 'Revise identidade e limites ocupacionais antes de salvar. Nada é cadastrado automaticamente.';
  }, [initialData.cas]);

  const occ = occupationalEnrich?.occupationalData;

  return (
    <Dialog open={open} onClose={onCloseUnsaved} maxWidth="md" fullWidth>
      <Box component="form" onSubmit={(handleSubmit as any)(onSubmit)}>
        <DialogTitle>Cadastrar fator químico</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1.5}>
            <Alert severity="info">{titleNote}</Alert>

            <Box
              sx={{
                p: 1.5,
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'grey.50',
              }}
            >
              <Typography variant="subtitle2" fontWeight={700} mb={0.5}>
                Identidade química
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Nome: {initialData.name || '—'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                CAS: {initialData.cas || '— (sem CAS confirmado)'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Fonte de identidade: PubChem + catálogo interno (etapa anterior).
              </Typography>
            </Box>

            <Box
              sx={{
                p: 1.5,
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'primary.light',
                bgcolor: 'background.paper',
              }}
            >
              <Typography variant="subtitle2" fontWeight={700} mb={0.75}>
                Dados ocupacionais encontrados
              </Typography>
              {occupationalLoading ? (
                <Stack direction="row" spacing={1} alignItems="center">
                  <CircularProgress size={16} />
                  <Typography variant="body2" color="text.secondary">
                    Consultando NIOSH / OSHA…
                  </Typography>
                </Stack>
              ) : !initialData.cas ? (
                <Alert severity="warning">
                  Sem CAS confirmado — a pesquisa de limites ocupacionais não é
                  executada.
                </Alert>
              ) : occ?.notFoundMessage ? (
                <Alert severity="info">{occ.notFoundMessage}</Alert>
              ) : (
                <Stack spacing={1}>
                  <OccupationalSourceBlock
                    title="NIOSH Pocket Guide"
                    url={occ?.niosh?.sourceUrl}
                    found={Boolean(occ?.niosh?.found)}
                    lines={[
                      [
                        'REL TWA',
                        formatOccupationalLine(occ?.niosh?.relTwa),
                      ],
                      ['STEL', formatOccupationalLine(occ?.niosh?.stel)],
                      ['Ceiling', formatOccupationalLine(occ?.niosh?.ceiling)],
                      ['IDLH/IPVS', formatOccupationalLine(occ?.niosh?.idlh)],
                      [
                        'Respirador',
                        formatOccupationalLine(occ?.niosh?.respirator),
                      ],
                    ]}
                  />
                  <OccupationalSourceBlock
                    title="OSHA Occupational Chemical Database"
                    url={occ?.osha?.sourceUrl}
                    found={Boolean(occ?.osha?.found)}
                    lines={[
                      ['PEL TWA', formatOccupationalLine(occ?.osha?.pel)],
                      ['STEL', formatOccupationalLine(occ?.osha?.stel)],
                      ['Ceiling', formatOccupationalLine(occ?.osha?.ceiling)],
                    ]}
                  />
                  {occ?.unitConflict || occ?.unitReviewRequired ? (
                    <Alert severity="warning">
                      Conflito/revisão de unidade — o campo “Unidade” não foi
                      pré-preenchido. Valores no formulário são apenas numéricos
                      (sem concatenar unidades). Revise alternativas
                      multiunidade manualmente.
                    </Alert>
                  ) : null}
                  {(occ?.warnings || []).slice(0, 4).map((warning) => (
                    <Typography
                      key={warning}
                      variant="caption"
                      color="text.secondary"
                      display="block"
                    >
                      {warning}
                    </Typography>
                  ))}
                  <Typography variant="caption" color="text.secondary">
                    NR-15, ACGIH e AIHA WEEL não são preenchidos automaticamente
                    nesta fase.
                  </Typography>
                </Stack>
              )}
            </Box>

            {duplicateRisks.length ? (
              <Alert
                severity="warning"
                action={
                  <Button
                    color="inherit"
                    size="small"
                    onClick={() => {
                      setAllowDuplicateCas(true);
                      setDuplicateRisks([]);
                    }}
                  >
                    Criar mesmo assim
                  </Button>
                }
              >
                Fatores com o mesmo CAS encontrados. Selecione um existente ou
                confirme a criação explícita.
                <Stack spacing={0.5} mt={1}>
                  {duplicateRisks.map((risk) => (
                    <Button
                      key={risk.id}
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        onSelectExisting?.(risk);
                        setDuplicateRisks([]);
                        setAllowDuplicateCas(false);
                        onClose();
                      }}
                    >
                      Usar: {risk.name}
                      {risk.cas ? ` [${risk.cas}]` : ''}
                      {risk.system ? ' · global' : ' · empresa'}
                    </Button>
                  ))}
                </Stack>
              </Alert>
            ) : null}
            <RiskEditorFields {...props} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCloseUnsaved} disabled={busy}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            type="submit"
            disabled={busy}
            onClick={() => setRiskData({ ...riskData, hasSubmit: true })}
          >
            {busy ? 'Salvando…' : 'Cadastrar fator químico'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

function formatOccupationalLine(
  value: ChemicalOccupationalValue | null | undefined,
): string | undefined {
  if (!value) return undefined;
  const formPart =
    value.applyStatus === 'APPLY_SAFE' && value.formValue
      ? `form: ${value.formValue}${value.unit ? ` ${value.unit}` : ''}`
      : value.applyStatus === 'UNIT_REVIEW_REQUIRED'
        ? 'form: revisão de unidade'
        : 'form: —';
  const rawPart = value.raw || value.value;
  const alternates =
    value.alternateRepresentations && value.alternateRepresentations.length
      ? ` | alt: ${value.alternateRepresentations.map((a) => a.rawFragment).join(', ')}`
      : '';
  return `${rawPart} (${formPart}${alternates})`;
}

function OccupationalSourceBlock(props: {
  title: string;
  url?: string | null;
  found: boolean;
  lines: Array<[string, string | null | undefined]>;
}) {
  const filled = props.lines.filter(([, value]) => Boolean(value));
  return (
    <Box
      sx={{
        p: 1,
        borderRadius: 1,
        bgcolor: 'grey.50',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Typography variant="body2" fontWeight={700}>
        {props.title}
        {props.url ? (
          <>
            {' · '}
            <Link href={props.url} target="_blank" rel="noreferrer" fontSize={12}>
              fonte
            </Link>
          </>
        ) : null}
      </Typography>
      {!props.found || !filled.length ? (
        <Typography variant="caption" color="text.secondary">
          Limite não localizado nas fontes consultadas.
        </Typography>
      ) : (
        filled.map(([label, value]) => (
          <Typography key={label} variant="caption" display="block">
            {label}: {value}
          </Typography>
        ))
      )}
    </Box>
  );
}
