import { createChemicalUseScenario } from '@v2/services/security/characterization/chemical-product/service/chemical-product.service';
import { useFetchBrowseChemicalProducts } from '@v2/services/security/characterization/chemical-product/hooks/useFetchBrowseChemicalProducts';
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
  submitCreateChemicalUseScenarioForm,
  type ChemicalUseScenarioFormValues,
} from './chemical-use-scenario-form.util';

type Props = {
  open: boolean;
  companyId: string;
  workspaceId: string;
  onClose: () => void;
  onCreated: () => void;
};

export const ChemicalUseScenarioFormDialog = ({
  open,
  companyId,
  workspaceId,
  onClose,
  onCreated,
}: Props) => {
  const [values, setValues] = useState<ChemicalUseScenarioFormValues>(
    emptyChemicalUseScenarioFormValues(),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    setValues(emptyChemicalUseScenarioFormValues());
    setError(null);
    setSaving(false);
    savingRef.current = false;
  }, [open]);

  const close = () => {
    if (savingRef.current) return;
    onClose();
  };

  const save = async () => {
    if (savingRef.current) return;
    savingRef.current = true;
    setError(null);
    setSaving(true);
    const result = await submitCreateChemicalUseScenarioForm({
      saving: false,
      values,
      create: (body) =>
        createChemicalUseScenario({
          companyId,
          workspaceId,
          ...body,
        }),
      onCreated,
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

  const submitBlocked = isChemicalUseScenarioSubmitBlocked({
    saving,
    values,
  });

  return (
    <Dialog open={open} onClose={close} fullWidth maxWidth="md">
      <DialogTitle>Novo cenário de uso</DialogTitle>
      <DialogContent>
        <ChemicalUseScenarioForm
          mode="create"
          productLocked={false}
          values={values}
          onChange={setValues}
          products={activeProducts}
          productsLoading={productsLoading}
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
