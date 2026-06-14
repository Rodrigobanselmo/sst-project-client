import { FC, useEffect, useState } from 'react';

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
} from '@mui/material';

import { createHoLaboratory } from '@v2/services/occupational-hygiene/ho-method/service/ho-method.service';
import type { HoLaboratoryRecord } from '@v2/services/occupational-hygiene/ho-method/service/ho-method.types';
import { getCnpj } from 'core/services/hooks/mutations/general/useMutationCnpj';
import { cnpjMask } from 'core/utils/masks/cnpj.mask';

import { getHoMethodApiErrorMessage } from '../utils/ho-method-error.util';

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: (laboratory: HoLaboratoryRecord) => void;
};

type FormState = {
  cnpj: string;
  corporateName: string;
  tradeName: string;
  email: string;
  phone: string;
  contactName: string;
  notes: string;
};

const emptyForm = (): FormState => ({
  cnpj: '',
  corporateName: '',
  tradeName: '',
  email: '',
  phone: '',
  contactName: '',
  notes: '',
});

export const HoLaboratoryFormModal: FC<Props> = ({
  open,
  onClose,
  onCreated,
}) => {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLookingUpCnpj, setIsLookingUpCnpj] = useState(false);
  const [lookupMessage, setLookupMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setForm(emptyForm());
    setSubmitError(null);
    setLookupMessage(null);
  }, [open]);

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleLookupCnpj = async () => {
    const digits = form.cnpj.replace(/\D/g, '');
    if (digits.length !== 14) {
      setLookupMessage('Informe um CNPJ válido com 14 dígitos para consultar.');
      return;
    }

    setLookupMessage(null);
    setIsLookingUpCnpj(true);
    try {
      const data = await getCnpj(digits);
      if (!data) {
        setLookupMessage(
          'Não foi possível consultar o CNPJ automaticamente. Preencha os dados manualmente.',
        );
        return;
      }

      setForm((current) => ({
        ...current,
        cnpj: cnpjMask.mask(digits),
        corporateName: data.name?.trim() || current.corporateName,
        tradeName: data.fantasy?.trim() || current.tradeName,
        email: current.email,
        phone: data.phone?.trim() || current.phone,
      }));
      setLookupMessage('Dados cadastrais preenchidos automaticamente a partir do CNPJ.');
    } catch {
      setLookupMessage(
        'Não foi possível consultar o CNPJ automaticamente. Preencha os dados manualmente.',
      );
    } finally {
      setIsLookingUpCnpj(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitError(null);

    const corporateName = form.corporateName.trim();
    if (!corporateName) {
      setSubmitError('Informe a razão social do laboratório.');
      return;
    }

    setIsSaving(true);
    try {
      const created = await createHoLaboratory({
        cnpj: form.cnpj.trim() || undefined,
        corporateName,
        tradeName: form.tradeName.trim() || undefined,
        email: form.email.trim() || undefined,
        phone: form.phone.trim() || undefined,
        contactName: form.contactName.trim() || undefined,
        notes: form.notes.trim() || undefined,
      });
      onCreated(created);
      onClose();
    } catch (error) {
      setSubmitError(
        getHoMethodApiErrorMessage(
          error,
          'Não foi possível cadastrar o laboratório.',
        ),
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Cadastrar laboratório</DialogTitle>
      <DialogContent>
        <Alert severity="info" sx={{ mb: 2 }}>
          Informe o CNPJ para consultar os dados cadastrais automaticamente,
          como nos cadastros de empresa e clínica do sistema.
        </Alert>

        {submitError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {submitError}
          </Alert>
        )}

        {lookupMessage && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {lookupMessage}
          </Alert>
        )}

        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              label="CNPJ"
              value={form.cnpj}
              onChange={(e) => updateField('cnpj', cnpjMask.apply(e.target.value))}
              placeholder="00.000.000/0000-00"
            />
          </Grid>
          <Grid item xs={12} md={4} display="flex" alignItems="flex-end">
            <Button
              fullWidth
              variant="outlined"
              onClick={() => void handleLookupCnpj()}
              disabled={isLookingUpCnpj}
              startIcon={
                isLookingUpCnpj ? (
                  <CircularProgress size={16} />
                ) : undefined
              }
            >
              Consultar CNPJ
            </Button>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required
              label="Razão social"
              value={form.corporateName}
              onChange={(e) => updateField('corporateName', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Nome fantasia"
              value={form.tradeName}
              onChange={(e) => updateField('tradeName', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="E-mail"
              value={form.email}
              onChange={(e) => updateField('email', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Telefone"
              value={form.phone}
              onChange={(e) => updateField('phone', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Contato"
              value={form.contactName}
              onChange={(e) => updateField('contactName', e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              minRows={2}
              label="Observações"
              value={form.notes}
              onChange={(e) => updateField('notes', e.target.value)}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSaving}>
          Cancelar
        </Button>
        <Button variant="contained" onClick={() => void handleSubmit()} disabled={isSaving}>
          {isSaving ? 'Salvando…' : 'Cadastrar laboratório'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
