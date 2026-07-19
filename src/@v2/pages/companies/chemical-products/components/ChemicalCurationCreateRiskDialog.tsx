import { FC, useMemo, useState } from 'react';

import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
} from '@mui/material';
import { RiskEditorFields } from 'components/organisms/modals/ModalAddRisk/components/RiskEditorFields/RiskEditorFields';
import {
  initialAddRiskState,
  useAddRisk,
} from 'components/organisms/modals/ModalAddRisk/hooks/useAddRisk';
import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';
import { useSnackbar } from 'notistack';

import { searchChemicalRiskFactors } from '@v2/services/security/characterization/chemical-product/service/chemical-product.service';
import type { ChemicalRiskOption } from '@v2/services/security/characterization/chemical-product/service/chemical-product.types';

import type { ChemicalCurationCreateRiskPrefill } from './chemical-curation-create-risk.util';
import {
  filterRisksWithSameCas,
  isValidCasRn,
  softNormalizeCas,
} from './chemical-curation-create-risk.util';

type Props = {
  open: boolean;
  companyId: string;
  workspaceId: string;
  initialData: ChemicalCurationCreateRiskPrefill;
  onClose: () => void;
  onCreated: (risk: IRiskFactors) => void;
  onSelectExisting?: (risk: ChemicalRiskOption) => void;
};

export const ChemicalCurationCreateRiskDialog: FC<Props> = ({
  open,
  companyId,
  workspaceId,
  initialData,
  onClose,
  onCreated,
  onSelectExisting,
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
    aiSuggestionSourceContext: {
      origin: 'ho-method-manual',
    },
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
      // Não chama onClose/onCancel aqui: useAddRisk (disableModalClose) não
      // dispara onCancel no sucesso; o painel aplica MANUAL_FACTOR e fecha.
      onCreated(created);
    },
  });

  const { riskData, setRiskData, handleSubmit, onSubmit, onCloseUnsaved, loading } =
    props;

  const busy = loading || checkingCas;

  const titleNote = useMemo(() => {
    if (!initialData.cas) {
      return 'Revise nome e CAS antes de salvar. O CAS não foi inventado automaticamente.';
    }
    return 'Revise os dados pré-preenchidos antes de salvar. Nada é cadastrado automaticamente.';
  }, [initialData.cas]);

  return (
    <Dialog open={open} onClose={onCloseUnsaved} maxWidth="md" fullWidth>
      <Box component="form" onSubmit={(handleSubmit as any)(onSubmit)}>
        <DialogTitle>Cadastrar fator químico</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1.5}>
            <Alert severity="info">{titleNote}</Alert>
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
