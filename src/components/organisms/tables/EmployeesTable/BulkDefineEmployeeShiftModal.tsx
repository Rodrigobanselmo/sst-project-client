import { FC, useState } from 'react';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
} from '@mui/material';
import SText from 'components/atoms/SText';

import { CompanyShift, useQueryCompanyShifts } from 'core/services/hooks/queries/useQueryCompanyShifts';

type Props = {
  open: boolean;
  count: number;
  isSaving: boolean;
  onClose: () => void;
  onConfirm: (shiftId: number | null) => void;
};

export const BulkDefineEmployeeShiftModal: FC<Props> = ({
  open,
  count,
  isSaving,
  onClose,
  onConfirm,
}) => {
  const { data: shifts } = useQueryCompanyShifts();
  const [value, setValue] = useState<string>('');

  const onSubmit = () => {
    onConfirm(value === '' ? null : Number(value));
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Definir turno</DialogTitle>
      <DialogContent>
        <SText fontSize={13} mb={2}>
          {`Esta ação atualizará o turno de ${count} funcionário(s) selecionado(s).`}
        </SText>
        <TextField
          select
          fullWidth
          size="small"
          label="Turno"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          sx={{ mt: 1 }}
        >
          <MenuItem value="">Sem turno</MenuItem>
          {shifts.map((shift: CompanyShift) => (
            <MenuItem key={shift.id} value={String(shift.id)}>
              {shift.durationMinutes
                ? `${shift.name} — ${shift.durationMinutes} min`
                : shift.name}
            </MenuItem>
          ))}
        </TextField>
        <SText fontSize={12} color="text.secondary" mt={2}>
          “Sem turno” remove o vínculo de turno dos selecionados.
        </SText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSaving}>
          Cancelar
        </Button>
        <Button variant="contained" onClick={onSubmit} disabled={isSaving}>
          Confirmar
        </Button>
      </DialogActions>
    </Dialog>
  );
};
