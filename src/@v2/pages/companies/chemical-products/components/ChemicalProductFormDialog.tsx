import { SText } from '@v2/components/atoms/SText/SText';
import { useMutateChemicalProduct } from '@v2/services/security/characterization/chemical-product/hooks/useMutateChemicalProduct';
import {
  browseChemicalManufacturers,
  searchChemicalRiskFactors,
} from '@v2/services/security/characterization/chemical-product/service/chemical-product.service';
import type {
  ChemicalConcentrationKind,
  ChemicalProductDetail,
  ChemicalRiskOption,
  ParseFispqResult,
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
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { useAuthShow } from 'components/molecules/SAuthShow';
import type { IRiskFactors } from 'core/interfaces/api/IRiskFactors';
import { useEffect, useMemo, useState } from 'react';

import {
  canAddExactComponent,
  clearIncompatibleConcentrationFields,
  compositionClientErrors,
  emptyIngredient,
  IngredientDraft,
} from './chemical-composition-draft.util';
import { canCreateChemicalRiskPermission } from './chemical-curation-create-risk.util';
import { ChemicalCurationCreateRiskDialog } from './ChemicalCurationCreateRiskDialog';
import { resolveChemicalDialogClose } from './chemical-dialog-close.util';
import { mapChemicalFispqImportError } from './chemical-fispq-import-error.util';
import { planRiskFactorIngredientFill } from './chemical-ingredient-risk-fill.util';
import {
  buildEditIngredientCreateRiskPrefill,
  canKeepWithoutRiskLink,
  clearIngredientRiskLink,
  confirmPendingRiskLink,
  countPendingRiskFactors,
  PendingRiskFactorByIngredientKey,
  pendingToRiskOption,
  removePendingRiskFactorByKey,
  setPendingRiskFactorByKey,
  toPendingRiskFactor,
} from './chemical-product-edit-risk-link.util';

type Mode = 'mixture' | 'pure' | 'fispq' | 'excel';

type Props = {
  open: boolean;
  onClose: () => void;
  companyId: string;
  workspaceId: string;
  editProduct?: ChemicalProductDetail | null;
  onOpenExcelImport?: () => void;
};

const riskLabel = (option: ChemicalRiskOption) =>
  `${option.name}${option.cas ? ` · CAS ${option.cas}` : ''}${
    option.system ? ' · global' : ' · empresa'
  }`;

export const ChemicalProductFormDialog = ({
  open,
  onClose,
  companyId,
  workspaceId,
  editProduct = null,
  onOpenExcelImport,
}: Props) => {
  const {
    createManual,
    createPure,
    createFromFispq,
    updateProduct,
    createComposition,
    parseFispq,
  } = useMutateChemicalProduct();

  const isEdit = Boolean(editProduct);
  const { isAuthSuccess } = useAuthShow();
  const canCreateRisk = canCreateChemicalRiskPermission({ isAuthSuccess });
  const [mode, setMode] = useState<Mode>('mixture');
  const [tradeName, setTradeName] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [manufacturerOptions, setManufacturerOptions] = useState<string[]>([]);
  const [manufacturerSearch, setManufacturerSearch] = useState('');
  const [ingredients, setIngredients] = useState<IngredientDraft[]>([
    emptyIngredient(),
  ]);
  const [riskOptions, setRiskOptions] = useState<ChemicalRiskOption[]>([]);
  const [riskSearchByKey, setRiskSearchByKey] = useState<Record<string, string>>(
    {},
  );
  const [pendingRiskFactorByIngredientKey, setPendingRiskFactorByIngredientKey] =
    useState<PendingRiskFactorByIngredientKey>({});
  const [createRiskIngredientKey, setCreateRiskIngredientKey] = useState<
    string | null
  >(null);
  const [selectedRisk, setSelectedRisk] = useState<ChemicalRiskOption | null>(
    null,
  );
  const [pureRiskSearch, setPureRiskSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);

  const [fispqParse, setFispqParse] = useState<ParseFispqResult | null>(null);
  const [fispqKeepFile, setFispqKeepFile] = useState(true);
  const [fispqVersionLabel, setFispqVersionLabel] = useState('');
  const [fispqIssuedAt, setFispqIssuedAt] = useState('');
  const [fispqLanguage, setFispqLanguage] = useState('pt');
  const [fispqPreviewReady, setFispqPreviewReady] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tradeNameTouched, setTradeNameTouched] = useState(false);
  const markDirty = () => setIsDirty(true);

  useEffect(() => {
    if (!open) return;
    if (editProduct) {
      setMode('mixture');
      setTradeName(editProduct.tradeName || '');
      setManufacturer(editProduct.manufacturer || '');
      const active = (editProduct.compositionVersions || []).find(
        (version) => version.status === 'ACTIVE',
      );
      setIngredients(
        active?.ingredients?.length
          ? active.ingredients.map((ingredient) => ({
              key: ingredient.id,
              chemicalName: ingredient.chemicalName,
              cas: ingredient.cas || '',
              concentrationKind: ingredient.concentrationKind,
              exactPercent: ingredient.exactPercent,
              minPercent: ingredient.minPercent,
              maxPercent: ingredient.maxPercent,
              riskFactorId: ingredient.riskFactorId,
              riskOption: ingredient.riskFactor || null,
            }))
          : [emptyIngredient()],
      );
      setPendingRiskFactorByIngredientKey({});
      setCreateRiskIngredientKey(null);
      setRiskSearchByKey({});
      setIsDirty(false);
      setTradeNameTouched(false);
      setIsSubmitting(false);
    } else {
      setPendingRiskFactorByIngredientKey({});
      setCreateRiskIngredientKey(null);
      setIsDirty(false);
      setTradeNameTouched(false);
      setIsSubmitting(false);
    }
  }, [open, editProduct]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    browseChemicalManufacturers({
      companyId,
      workspaceId,
      search: manufacturerSearch,
    })
      .then((rows) => {
        if (!cancelled) setManufacturerOptions(rows);
      })
      .catch(() => {
        if (!cancelled) setManufacturerOptions([]);
      });
    return () => {
      cancelled = true;
    };
  }, [open, companyId, workspaceId, manufacturerSearch]);

  const activeRiskSearch = useMemo(() => {
    if (mode === 'pure') return pureRiskSearch;
    const values = Object.values(riskSearchByKey);
    return values[values.length - 1] || '';
  }, [mode, pureRiskSearch, riskSearchByKey]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    searchChemicalRiskFactors({
      companyId,
      workspaceId,
      search: activeRiskSearch,
    })
      .then((rows) => {
        if (!cancelled) setRiskOptions(rows);
      })
      .catch(() => {
        if (!cancelled) setRiskOptions([]);
      });
    return () => {
      cancelled = true;
    };
  }, [open, companyId, workspaceId, activeRiskSearch]);

  const compositionState = useMemo(
    () => compositionClientErrors(ingredients),
    [ingredients],
  );

  const reset = () => {
    setMode('mixture');
    setTradeName('');
    setManufacturer('');
    setIngredients([emptyIngredient()]);
    setSelectedRisk(null);
    setError(null);
    setWarnings([]);
    setFispqParse(null);
    setFispqKeepFile(true);
    setFispqVersionLabel('');
    setFispqIssuedAt('');
    setFispqLanguage('pt');
    setFispqPreviewReady(false);
    setRiskSearchByKey({});
    setPendingRiskFactorByIngredientKey({});
    setCreateRiskIngredientKey(null);
    setPureRiskSearch('');
    setIsDirty(false);
    setIsSubmitting(false);
    setTradeNameTouched(false);
  };

  const hasDraft = isDirty || Boolean(fispqParse);

  const closeAfterSave = () => {
    reset();
    onClose();
  };

  const requestClose = (reason: string = 'closeButton') => {
    if (isSubmitting) return;
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
    reset();
    onClose();
  };

  const handleClose = () => requestClose('closeButton');

  const updateIngredient = (key: string, patch: Partial<IngredientDraft>) => {
    markDirty();
    setIngredients((current) =>
      current.map((item) => (item.key === key ? { ...item, ...patch } : item)),
    );
  };

  const setPendingForIngredient = (
    ingredientKey: string,
    risk: ChemicalRiskOption | null,
  ) => {
    markDirty();
    setPendingRiskFactorByIngredientKey((current) =>
      setPendingRiskFactorByKey(
        current,
        ingredientKey,
        risk ? toPendingRiskFactor(risk) : null,
      ),
    );
  };

  const confirmPendingForIngredient = (ingredient: IngredientDraft) => {
    const pending = pendingRiskFactorByIngredientKey[ingredient.key];
    if (!pending) return;
    markDirty();
    setIngredients((current) =>
      current.map((item) =>
        item.key === ingredient.key
          ? confirmPendingRiskLink({ ingredient: item, pending })
          : item,
      ),
    );
    setPendingRiskFactorByIngredientKey((current) =>
      removePendingRiskFactorByKey(current, ingredient.key),
    );
  };

  const keepIngredientWithoutRisk = (ingredient: IngredientDraft) => {
    if (
      !canKeepWithoutRiskLink({
        ingredient,
        pending: pendingRiskFactorByIngredientKey[ingredient.key] || null,
      })
    ) {
      return;
    }
    markDirty();
    setIngredients((current) =>
      current.map((item) =>
        item.key === ingredient.key ? clearIngredientRiskLink(item) : item,
      ),
    );
    setPendingRiskFactorByIngredientKey((current) =>
      removePendingRiskFactorByKey(current, ingredient.key),
    );
  };

  const removeIngredient = (ingredientKey: string) => {
    markDirty();
    setIngredients((current) =>
      current.filter((item) => item.key !== ingredientKey),
    );
    setPendingRiskFactorByIngredientKey((current) =>
      removePendingRiskFactorByKey(current, ingredientKey),
    );
    setRiskSearchByKey((current) => {
      if (!(ingredientKey in current)) return current;
      const next = { ...current };
      delete next[ingredientKey];
      return next;
    });
    if (createRiskIngredientKey === ingredientKey) {
      setCreateRiskIngredientKey(null);
    }
  };

  const applyRiskToIngredient = (
    ingredient: IngredientDraft,
    risk: ChemicalRiskOption | null,
  ) => {
    if (!risk) {
      updateIngredient(ingredient.key, {
        riskFactorId: null,
        riskOption: null,
      });
      return;
    }

    const input = {
      ingredient: {
        chemicalName: ingredient.chemicalName,
        cas: ingredient.cas || '',
        riskFactorId: ingredient.riskFactorId || null,
      },
      risk: { id: risk.id, name: risk.name, cas: risk.cas },
    };

    const planned = planRiskFactorIngredientFill(input);
    if (planned.needsOverwriteConfirm) {
      const ok = window.confirm(
        'Substituir nome químico/CAS pelos dados do fator de risco selecionado?',
      );
      if (!ok) return;
      const applied = planRiskFactorIngredientFill({
        ...input,
        confirmOverwrite: true,
      });
      updateIngredient(ingredient.key, {
        riskFactorId: applied.riskFactorId,
        riskOption: risk,
        chemicalName: applied.chemicalName,
        cas: applied.cas,
      });
      return;
    }

    updateIngredient(ingredient.key, {
      riskFactorId: planned.riskFactorId,
      riskOption: risk,
      chemicalName: planned.chemicalName,
      cas: planned.cas,
    });
  };

  const createdRiskToOption = (created: IRiskFactors): ChemicalRiskOption => ({
    id: created.id,
    name: created.name,
    cas: created.cas || null,
    system: Boolean(created.system),
    companyId: created.companyId || companyId,
    type: String(created.type || 'QUI'),
  });

  const createRiskIngredient = createRiskIngredientKey
    ? ingredients.find((item) => item.key === createRiskIngredientKey) || null
    : null;

  const createRiskPrefill = useMemo(
    () =>
      buildEditIngredientCreateRiskPrefill({
        companyId,
        chemicalName: createRiskIngredient?.chemicalName || '',
        cas: createRiskIngredient?.cas || '',
      }),
    [
      companyId,
      createRiskIngredient?.chemicalName,
      createRiskIngredient?.cas,
      createRiskIngredientKey,
    ],
  );

  const handleParseFispq = async (file: File | null) => {
    if (!file) return;
    setError(null);
    setFispqPreviewReady(false);
    markDirty();
    try {
      const parsed = await parseFispq.mutateAsync({
        companyId,
        workspaceId,
        file,
      });
      setFispqParse(parsed);
      setFispqKeepFile(true);

      if (!parsed.extractable) {
        setError(
          parsed.message ||
            'Não foi possível extrair texto deste PDF. Continue pelo cadastro manual.',
        );
        return;
      }

      const preview = parsed.preview;
      setTradeName(preview?.tradeName || '');
      setManufacturer(preview?.manufacturer || '');
      setFispqVersionLabel(preview?.versionLabel || '');
      setFispqIssuedAt(preview?.issuedAt || '');
      setFispqLanguage(preview?.language || 'pt');
      setIngredients(
        preview?.ingredients?.length
          ? preview.ingredients.map((ingredient) => ({
              ...emptyIngredient(),
              chemicalName: ingredient.chemicalName || '',
              cas: ingredient.cas || '',
              concentrationKind: ingredient.concentrationKind,
              exactPercent: ingredient.exactPercent,
              minPercent: ingredient.minPercent,
              maxPercent: ingredient.maxPercent,
              riskFactorId: ingredient.riskFactorId || null,
              riskOption: ingredient.riskFactor || null,
              matchStatus: ingredient.matchStatus || null,
              pending: Boolean(ingredient.pending),
              pendingReason: ingredient.pendingReason || null,
            }))
          : [emptyIngredient()],
      );
      setFispqPreviewReady(true);
    } catch (err: any) {
      setError(mapChemicalFispqImportError(err));
    }
  };

  const toPayload = (rows: IngredientDraft[]) =>
    rows.map((ingredient, index) => ({
      chemicalName: ingredient.chemicalName,
      cas: ingredient.cas || null,
      concentrationKind: ingredient.concentrationKind,
      exactPercent: ingredient.exactPercent ?? null,
      minPercent: ingredient.minPercent ?? null,
      maxPercent: ingredient.maxPercent ?? null,
      riskFactorId: ingredient.riskFactorId || null,
      sortOrder: index,
    }));

  const handleSave = async () => {
    if (isSubmitting || pending) return;
    setError(null);
    setWarnings([]);

    if (mode !== 'pure') {
      if (Object.keys(compositionState.rowErrors).length) {
        setError('Corrija os componentes incompletos antes de salvar.');
        return;
      }
      if (compositionState.exceeds) {
        setError(compositionState.globalErrors.join('\n'));
        return;
      }
    }

    if (isEdit && countPendingRiskFactors(pendingRiskFactorByIngredientKey) > 0) {
      setError(
        'Há fator(es) selecionado(s) aguardando confirmação. Confirme o vínculo ou cancele a seleção antes de salvar.',
      );
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEdit && editProduct) {
        await updateProduct.mutateAsync({
          companyId,
          workspaceId,
          productId: editProduct.id,
          tradeName: tradeName.trim(),
          manufacturer: manufacturer.trim() || null,
        });
        await createComposition.mutateAsync({
          companyId,
          workspaceId,
          productId: editProduct.id,
          sourceType: editProduct.isPureSubstance ? 'PURE' : 'MANUAL',
          ingredients: toPayload(ingredients),
        });
        setIsDirty(false);
        closeAfterSave();
        return;
      }

      if (mode === 'pure') {
        if (!selectedRisk) return;
        const result = await createPure.mutateAsync({
          companyId,
          workspaceId,
          riskFactorId: selectedRisk.id,
          tradeName: tradeName.trim() || selectedRisk.name,
          manufacturer: manufacturer.trim() || null,
        });
        setWarnings(result?.compositionWarnings || []);
      } else if (mode === 'fispq') {
        if (!fispqParse?.fileId || !fispqKeepFile) {
          setError('Selecione e mantenha o PDF da FISPQ para criar o produto.');
          return;
        }
        if (!tradeName.trim()) {
          setError('Revise o nome comercial antes de confirmar.');
          return;
        }
        const result = await createFromFispq.mutateAsync({
          companyId,
          workspaceId,
          fileId: fispqParse.fileId,
          tradeName: tradeName.trim(),
          manufacturer: manufacturer.trim() || null,
          versionLabel: fispqVersionLabel || null,
          issuedAt: fispqIssuedAt || null,
          language: fispqLanguage || null,
          ingredients: toPayload(ingredients),
        });
        setWarnings(result?.compositionWarnings || []);
      } else {
        const result = await createManual.mutateAsync({
          companyId,
          workspaceId,
          tradeName: tradeName.trim(),
          manufacturer: manufacturer.trim() || null,
          isPureSubstance: false,
          ingredients: toPayload(ingredients),
        });
        setWarnings(result?.compositionWarnings || []);
      }
      setIsDirty(false);
      closeAfterSave();
    } catch (err: any) {
      const payload = err?.response?.data;
      const messages = payload?.errors || payload?.message || payload?.blockers;
      setError(
        Array.isArray(messages)
          ? messages.join('\n')
          : typeof messages === 'string'
            ? messages
            : 'Não foi possível salvar o produto.',
      );
      if (Array.isArray(payload?.warnings)) {
        setWarnings(payload.warnings);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const continueManualFromFispq = () => {
    setMode('mixture');
    setError(null);
    setFispqPreviewReady(false);
    // Mantém PDF anexado no estado só como referência; produto vai ser criado manualmente.
    if (fispqParse?.preview?.tradeName) setTradeName(fispqParse.preview.tradeName);
    if (fispqParse?.preview?.manufacturer) {
      setManufacturer(fispqParse.preview.manufacturer);
    }
  };

  const pending =
    isSubmitting ||
    createManual.isPending ||
    createPure.isPending ||
    createFromFispq.isPending ||
    updateProduct.isPending ||
    createComposition.isPending ||
    parseFispq.isPending;

  const blockingReason = (() => {
    if (pending) return 'Aguarde o término da operação.';
    if (mode === 'pure' && !isEdit) {
      if (!selectedRisk) return 'Selecione o fator de risco do produto puro.';
      return null;
    }
    if (mode !== 'pure' || isEdit) {
      if (Object.keys(compositionState.rowErrors).length) {
        return 'Corrija os componentes incompletos antes de salvar.';
      }
      if (compositionState.exceeds) {
        return compositionState.globalErrors.join(' ');
      }
    }
    if (isEdit) {
      if (!tradeName.trim()) return 'Informe o nome comercial.';
      return null;
    }
    if (mode === 'fispq') {
      if (!fispqParse?.fileId || !fispqKeepFile) {
        return 'Selecione e mantenha o PDF da FISPQ.';
      }
      if (!tradeName.trim()) return 'Informe o nome comercial.';
      if (fispqParse.extractable && !fispqPreviewReady) {
        return 'Aguarde o preview da FISPQ.';
      }
      return null;
    }
    if (!tradeName.trim()) return 'Informe o nome comercial.';
    if (!ingredients.length) return 'Informe ao menos um componente.';
    return null;
  })();

  const canSubmit = !blockingReason;

  const renderIngredientEditor = (ingredient: IngredientDraft, index: number) => {
    const rowErrors = compositionState.rowErrors[ingredient.key] || [];
    const pendingRisk = pendingRiskFactorByIngredientKey[ingredient.key] || null;
    const pendingOption = pendingRisk ? pendingToRiskOption(pendingRisk) : null;
    const options = (() => {
      const selected = isEdit
        ? pendingOption || null
        : ingredient.riskOption || null;
      if (!selected) return riskOptions;
      return [
        selected,
        ...riskOptions.filter((option) => option.id !== selected.id),
      ];
    })();
    const canKeepWithout = canKeepWithoutRiskLink({
      ingredient,
      pending: pendingRisk,
    });

    return (
      <Stack
        key={ingredient.key}
        spacing={1.25}
        p={1.5}
        border="1px solid"
        borderColor={rowErrors.length ? 'error.light' : 'divider'}
        borderRadius={1}
      >
        <SText fontWeight={600}>Componente {index + 1}</SText>
        <Stack direction="row" spacing={0.75} flexWrap="wrap">
          {ingredient.matchStatus === 'MATCHED' ? (
            <Chip size="small" color="success" label="Fator vinculado por CAS" />
          ) : null}
          {ingredient.matchStatus === 'NO_MATCH' ? (
            <Chip size="small" color="warning" label="Sem correspondência" />
          ) : null}
          {ingredient.pending ? (
            <Chip
              size="small"
              color="warning"
              label={ingredient.pendingReason || 'Pendente de revisão'}
            />
          ) : null}
        </Stack>

        {isEdit ? (
          <Box
            sx={{
              p: 1.25,
              borderRadius: 1,
              bgcolor: 'action.hover',
              border: '1px solid',
              borderColor: pendingRisk ? 'warning.main' : 'primary.main',
            }}
          >
            <Stack spacing={1}>
              {ingredient.riskOption ? (
                <Alert severity="success" sx={{ py: 0.5 }}>
                  Fator atual:{' '}
                  <strong>{riskLabel(ingredient.riskOption)}</strong>
                </Alert>
              ) : (
                <Alert severity="info" sx={{ py: 0.5 }}>
                  Componente sem vínculo de fator de risco.
                </Alert>
              )}

              {pendingRisk ? (
                <Alert severity="warning" sx={{ py: 0.5 }}>
                  Fator selecionado (aguardando confirmação):{' '}
                  <strong>{riskLabel(pendingToRiskOption(pendingRisk))}</strong>
                </Alert>
              ) : null}

              <Autocomplete
                options={options}
                value={pendingOption}
                onChange={(_, value) =>
                  setPendingForIngredient(ingredient.key, value)
                }
                onInputChange={(_, value, reason) => {
                  if (reason === 'input') {
                    setRiskSearchByKey((current) => ({
                      ...current,
                      [ingredient.key]: value,
                    }));
                  }
                }}
                getOptionLabel={riskLabel}
                isOptionEqualToValue={(a, b) => a.id === b.id}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Buscar fator (nome ou CAS)"
                    helperText="A seleção prepara o vínculo. Confirme antes de salvar."
                  />
                )}
              />

              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {pendingRisk ? (
                  <>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => confirmPendingForIngredient(ingredient)}
                    >
                      Confirmar vínculo
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() =>
                        setPendingForIngredient(ingredient.key, null)
                      }
                    >
                      Trocar fator
                    </Button>
                  </>
                ) : null}
                {canCreateRisk ? (
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() =>
                      setCreateRiskIngredientKey(ingredient.key)
                    }
                  >
                    Cadastrar fator químico
                  </Button>
                ) : null}
                <Button
                  size="small"
                  color="warning"
                  variant="outlined"
                  disabled={!canKeepWithout}
                  onClick={() => keepIngredientWithoutRisk(ingredient)}
                >
                  Manter sem vínculo
                </Button>
              </Stack>
            </Stack>
          </Box>
        ) : (
          <Box
            sx={{
              p: 1.25,
              borderRadius: 1,
              bgcolor: 'action.hover',
              border: '1px solid',
              borderColor: 'primary.main',
            }}
          >
            <Autocomplete
              options={options}
              value={ingredient.riskOption || null}
              onChange={(_, value) => applyRiskToIngredient(ingredient, value)}
              onInputChange={(_, value, reason) => {
                if (reason === 'input') {
                  setRiskSearchByKey((current) => ({
                    ...current,
                    [ingredient.key]: value,
                  }));
                }
              }}
              getOptionLabel={riskLabel}
              isOptionEqualToValue={(a, b) => a.id === b.id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Fator de risco (global ou da empresa)"
                  helperText={
                    ingredient.riskOption
                      ? `Selecionado: ${riskLabel(ingredient.riskOption)}`
                      : 'Sem vínculo — preencha nome/CAS manualmente se necessário'
                  }
                />
              )}
            />
          </Box>
        )}

        <TextField
          label="Nome químico"
          value={ingredient.chemicalName}
          onChange={(e) =>
            updateIngredient(ingredient.key, { chemicalName: e.target.value })
          }
        />
        <TextField
          label="CAS"
          value={ingredient.cas || ''}
          onChange={(e) =>
            updateIngredient(ingredient.key, { cas: e.target.value })
          }
          helperText={
            ingredient.riskOption && !(ingredient.cas || '').trim()
              ? 'CAS não cadastrado no fator'
              : undefined
          }
        />
        <FormControl>
          <InputLabel>Tipo de concentração</InputLabel>
          <Select
            label="Tipo de concentração"
            value={ingredient.concentrationKind}
            onChange={(e) =>
              updateIngredient(
                ingredient.key,
                clearIncompatibleConcentrationFields(
                  e.target.value as ChemicalConcentrationKind,
                ),
              )
            }
          >
            <MenuItem value="EXACT">Exata (%)</MenuItem>
            <MenuItem value="RANGE">Faixa (%)</MenuItem>
            <MenuItem value="CONFIDENTIAL">Confidencial</MenuItem>
            <MenuItem value="NOT_INFORMED">Não informada</MenuItem>
            <MenuItem value="UNDETERMINED">Não determinada</MenuItem>
          </Select>
        </FormControl>
        {ingredient.concentrationKind === 'EXACT' ? (
          <TextField
            type="number"
            label="Percentual exato"
            value={ingredient.exactPercent ?? ''}
            onChange={(e) =>
              updateIngredient(ingredient.key, {
                exactPercent: e.target.value ? Number(e.target.value) : null,
              })
            }
          />
        ) : null}
        {ingredient.concentrationKind === 'RANGE' ? (
          <Stack direction="row" spacing={1}>
            <TextField
              type="number"
              label="Mín %"
              value={ingredient.minPercent ?? ''}
              onChange={(e) =>
                updateIngredient(ingredient.key, {
                  minPercent: e.target.value ? Number(e.target.value) : null,
                })
              }
            />
            <TextField
              type="number"
              label="Máx %"
              value={ingredient.maxPercent ?? ''}
              onChange={(e) =>
                updateIngredient(ingredient.key, {
                  maxPercent: e.target.value ? Number(e.target.value) : null,
                })
              }
            />
          </Stack>
        ) : null}

        {rowErrors.map((message) => (
          <Alert key={message} severity="error">
            {message}
          </Alert>
        ))}

        {ingredients.length > 1 ? (
          <Button
            color="warning"
            onClick={() => removeIngredient(ingredient.key)}
          >
            Remover componente
          </Button>
        ) : null}
      </Stack>
    );
  };

  return (
    <>
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
      <DialogTitle>
        {isEdit ? 'Editar produto químico' : 'Novo produto químico'}
      </DialogTitle>
      <DialogContent
        sx={{
          overflowY: 'auto',
          flex: 1,
          minHeight: 0,
        }}
      >
        <Stack spacing={2} mt={1}>
          {!isEdit ? (
            <ToggleButtonGroup
              exclusive
              size="small"
              value={mode}
              onChange={(_, value) => {
                if (!value) return;
                if (value === 'excel') {
                  onOpenExcelImport?.();
                  return;
                }
                markDirty();
                setMode(value);
              }}
            >
              <ToggleButton value="mixture">Mistura manual</ToggleButton>
              <ToggleButton value="pure">Produto puro por fator</ToggleButton>
              <ToggleButton value="fispq">Importar FISPQ</ToggleButton>
              <ToggleButton value="excel">Importar Excel</ToggleButton>
            </ToggleButtonGroup>
          ) : null}

          {mode === 'fispq' && !isEdit ? (
            <Stack spacing={1.5}>
              <Button variant="outlined" component="label">
                Selecionar PDF da FISPQ
                <input
                  hidden
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={(e) =>
                    handleParseFispq(e.target.files?.[0] || null)
                  }
                />
              </Button>
              {fispqParse ? (
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip
                    size="small"
                    color={fispqParse.extractable ? 'success' : 'warning'}
                    label={
                      fispqParse.extractable
                        ? 'Texto extraído — revise antes de salvar'
                        : 'Sem texto extraível'
                    }
                  />
                  <SText fontSize={13}>{fispqParse.fileName}</SText>
                  <Button
                    size="small"
                    onClick={() => {
                      setFispqKeepFile(false);
                      setFispqParse(null);
                      setFispqPreviewReady(false);
                    }}
                  >
                    Remover PDF
                  </Button>
                </Stack>
              ) : null}
              {fispqParse && !fispqParse.extractable ? (
                <Alert severity="warning">
                  {fispqParse.message}
                  <Box mt={1}>
                    <Button size="small" onClick={continueManualFromFispq}>
                      Continuar pelo cadastro manual
                    </Button>
                  </Box>
                </Alert>
              ) : null}
              {fispqPreviewReady ? (
                <Alert severity="info">
                  Preview revisável — nada foi gravado ainda. Confirme os campos
                  abaixo para criar o produto.
                </Alert>
              ) : null}
            </Stack>
          ) : null}

          {mode === 'pure' && !isEdit ? (
            <>
              <Box
                sx={{
                  p: 1.25,
                  borderRadius: 1,
                  bgcolor: 'action.hover',
                  border: '1px solid',
                  borderColor: 'primary.main',
                }}
              >
                <Autocomplete
                  options={riskOptions}
                  value={selectedRisk}
                  onChange={(_, value) => {
                    markDirty();
                    setSelectedRisk(value);
                    if (!value) return;
                    if (!tradeNameTouched || !tradeName.trim()) {
                      setTradeName(value.name);
                    }
                  }}
                  onInputChange={(_, value, reason) => {
                    if (reason === 'input') setPureRiskSearch(value);
                  }}
                  getOptionLabel={riskLabel}
                  isOptionEqualToValue={(a, b) => a.id === b.id}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Fator de risco"
                      helperText={
                        selectedRisk
                          ? `Selecionado: ${riskLabel(selectedRisk)}`
                          : 'Pesquise fatores globais e da empresa'
                      }
                    />
                  )}
                />
              </Box>
              <TextField
                label="Nome comercial (opcional — se vazio usa o nome do fator)"
                value={tradeName}
                onChange={(e) => {
                  markDirty();
                  setTradeNameTouched(true);
                  setTradeName(e.target.value);
                }}
              />
            </>
          ) : null}

          {(mode === 'mixture' ||
            mode === 'fispq' ||
            isEdit) &&
          !(mode === 'fispq' && !fispqParse && !isEdit) ? (
            <>
              <TextField
                label="Nome comercial"
                value={tradeName}
                onChange={(e) => {
                  markDirty();
                  setTradeName(e.target.value);
                }}
                required
              />

              {mode === 'fispq' && fispqPreviewReady ? (
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                  <TextField
                    label="Versão FISPQ"
                    value={fispqVersionLabel}
                    onChange={(e) => {
                      markDirty();
                      setFispqVersionLabel(e.target.value);
                    }}
                    fullWidth
                  />
                  <TextField
                    label="Data"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={fispqIssuedAt}
                    onChange={(e) => {
                      markDirty();
                      setFispqIssuedAt(e.target.value);
                    }}
                    fullWidth
                  />
                  <TextField
                    label="Idioma"
                    value={fispqLanguage}
                    onChange={(e) => {
                      markDirty();
                      setFispqLanguage(e.target.value);
                    }}
                    fullWidth
                  />
                </Stack>
              ) : null}

              {ingredients.map((ingredient, index) =>
                renderIngredientEditor(ingredient, index),
              )}

              <Alert
                severity={
                  compositionState.exceeds
                    ? 'error'
                    : compositionState.incomplete
                      ? 'warning'
                      : 'success'
                }
              >
                Soma informada (exata): {compositionState.exactSum.toFixed(2)}%
                {' · '}
                Restante: {compositionState.remaining.toFixed(2)}%
                {compositionState.incomplete
                  ? ' · composição incompleta (< 100%)'
                  : ''}
                {compositionState.exceeds ? ' · excedeu 100%' : ''}
              </Alert>

              <Button
                disabled={!canAddExactComponent(compositionState.exactSum)}
                onClick={() => {
                  if (!canAddExactComponent(compositionState.exactSum)) return;
                  setIngredients((current) => [...current, emptyIngredient()]);
                }}
              >
                {canAddExactComponent(compositionState.exactSum)
                  ? 'Adicionar componente'
                  : 'Não é possível adicionar componente exato (soma ≥ 100%)'}
              </Button>
            </>
          ) : null}

          <Autocomplete
            freeSolo
            options={manufacturerOptions}
            value={manufacturer}
            onInputChange={(_, value) => {
              markDirty();
              setManufacturer(value);
              setManufacturerSearch(value);
            }}
            onChange={(_, value) => {
              markDirty();
              setManufacturer(typeof value === 'string' ? value : value || '');
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Fabricante"
                helperText="Sugestões dos fabricantes já usados na empresa"
              />
            )}
          />

          {error ? (
            <Alert severity="error" sx={{ whiteSpace: 'pre-wrap' }}>
              {error}
            </Alert>
          ) : null}
          {warnings.length ? (
            <Alert severity="warning">{warnings.join('\n')}</Alert>
          ) : null}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ flexDirection: 'column', alignItems: 'stretch', gap: 1 }}>
        {blockingReason && !pending ? (
          <Alert severity="warning" sx={{ width: '100%' }}>
            {blockingReason}
          </Alert>
        ) : null}
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Button onClick={handleClose} disabled={pending}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            disabled={!canSubmit || pending}
            onClick={handleSave}
          >
            {pending
              ? 'Salvando…'
              : isEdit
                ? 'Salvar edição'
                : mode === 'fispq'
                  ? 'Confirmar criação pela FISPQ'
                  : 'Salvar'}
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>

      {createRiskIngredientKey && createRiskIngredient ? (
        <ChemicalCurationCreateRiskDialog
          open
          companyId={companyId}
          workspaceId={workspaceId}
          initialData={createRiskPrefill}
          onClose={() => setCreateRiskIngredientKey(null)}
          onCreated={(created) => {
            const option = createdRiskToOption(created);
            setPendingForIngredient(createRiskIngredientKey, option);
            setCreateRiskIngredientKey(null);
          }}
          onSelectExisting={(risk) => {
            setPendingForIngredient(createRiskIngredientKey, risk);
            setCreateRiskIngredientKey(null);
          }}
        />
      ) : null}
    </>
  );
};
