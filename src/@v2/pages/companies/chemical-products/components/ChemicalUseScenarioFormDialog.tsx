import {
  browseTechnicalWorkspaceGses,
  createChemicalUseScenario,
  updateChemicalUseScenario,
  type TechnicalWorkspaceGseOption,
} from '@v2/services/security/characterization/chemical-product/service/chemical-product.service';
import { useFetchBrowseChemicalProducts } from '@v2/services/security/characterization/chemical-product/hooks/useFetchBrowseChemicalProducts';
import type { ChemicalUseScenarioBoardRow } from '@v2/services/security/characterization/chemical-product/service/chemical-product.types';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import { useEffect, useMemo, useRef, useState } from 'react';

import { ChemicalUseScenarioForm } from './ChemicalUseScenarioForm';
import {
  emptyChemicalUseScenarioFormValues,
  isChemicalUseScenarioSubmitBlocked,
  isChemicalUseScenarioUpdateBlocked,
  submitCreateChemicalUseScenarioForm,
  submitUpdateChemicalUseScenarioForm,
  valuesFromChemicalUseScenario,
  type ChemicalUseScenarioFormValues,
} from './chemical-use-scenario-form.util';

type Props = {
  open: boolean;
  companyId: string;
  workspaceId: string;
  scenario?: ChemicalUseScenarioBoardRow | null;
  onClose: () => void;
  onSaved: () => void;
};

export const ChemicalUseScenarioFormDialog = ({
  open,
  companyId,
  workspaceId,
  scenario = null,
  onClose,
  onSaved,
}: Props) => {
  const isEdit = Boolean(scenario?.id && scenario.kind === 'SCENARIO');
  const [values, setValues] = useState<ChemicalUseScenarioFormValues>(
    emptyChemicalUseScenarioFormValues(),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gseOptions, setGseOptions] = useState<TechnicalWorkspaceGseOption[]>(
    [],
  );
  const [gseOptionsLoading, setGseOptionsLoading] = useState(false);
  const savingRef = useRef(false);

  const { data: products, isLoading: productsLoading } =
    useFetchBrowseChemicalProducts(
      { companyId, workspaceId, includeArchived: false },
      open,
    );

  const activeProducts = useMemo(
    () => (products || []).filter((product) => product.status === 'ACTIVE'),
    [products],
  );

  useEffect(() => {
    if (!open) return;
    setError(null);
    setSaving(false);
    savingRef.current = false;
    if (isEdit && scenario) {
      setValues(valuesFromChemicalUseScenario(scenario, activeProducts));
      return;
    }
    setValues(emptyChemicalUseScenarioFormValues());
    // Reset only when the dialog opens or the edited scenario changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, scenario?.id]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setGseOptionsLoading(true);
    browseTechnicalWorkspaceGses({ companyId, workspaceId })
      .then((data) => {
        if (!cancelled) setGseOptions(data);
      })
      .catch(() => {
        if (!cancelled) setGseOptions([]);
      })
      .finally(() => {
        if (!cancelled) setGseOptionsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, companyId, workspaceId]);

  const close = () => {
    if (savingRef.current) return;
    onClose();
  };

  const save = async () => {
    if (savingRef.current) return;
    savingRef.current = true;
    setError(null);
    setSaving(true);
    const result = isEdit && scenario
      ? await submitUpdateChemicalUseScenarioForm({
          saving: false,
          values,
          update: (body) =>
            updateChemicalUseScenario({
              companyId,
              workspaceId,
              scenarioId: scenario.id,
              ...body,
            }),
          onUpdated: onSaved,
        })
      : await submitCreateChemicalUseScenarioForm({
          saving: false,
          values,
          create: (body) =>
            createChemicalUseScenario({
              companyId,
              workspaceId,
              ...body,
            }),
          onCreated: onSaved,
        });
    if (result.status === 'ok') {
      savingRef.current = false;
      setSaving(false);
      onClose();
      return;
    }
    if (result.status === 'invalid' || result.status === 'error') {
      setError(result.error);
    }
    savingRef.current = false;
    setSaving(false);
  };

  const submitBlocked = isEdit
    ? isChemicalUseScenarioUpdateBlocked({ saving, values })
    : isChemicalUseScenarioSubmitBlocked({ saving, values });

  return (
    <Dialog open={open} onClose={close} fullWidth maxWidth="md">
      <DialogTitle>
        {isEdit ? 'Editar cenário de uso' : 'Novo cenário de uso'}
      </DialogTitle>
      <DialogContent sx={{ pt: 1.5 }}>
        <ChemicalUseScenarioForm
          mode={isEdit ? 'edit' : 'create'}
          productLocked={isEdit}
          values={values}
          onChange={setValues}
          products={activeProducts}
          productsLoading={productsLoading}
          gseOptions={gseOptions}
          gseOptionsLoading={gseOptionsLoading}
          disabled={saving}
          error={error}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={close} disabled={saving}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={() => void save()}
          disabled={submitBlocked}
        >
          {saving ? 'Salvando...' : 'Salvar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
