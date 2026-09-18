import { FC, useState } from 'react';

import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from '@mui/material';

import {
  RiskMatrixCreateSourceEnum,
  type CreateRiskMatrixPayload,
} from '@v2/services/security/risk-matrix/service/risk-matrix.types';

import { RISK_MATRIX_CREATE_SOURCE_HELP } from '../maps/risk-matrix.maps';
import { getRiskMatrixApiErrorMessage } from '../utils/risk-matrix-error.util';
import { buildCreateRiskMatrixPayload } from '../utils/risk-matrix-create.util';

const NAME_MAX = 255;
const DESCRIPTION_MAX = 2000;

type RiskMatrixCreateDialogProps = {
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateRiskMatrixPayload) => Promise<void>;
};

export const RiskMatrixCreateDialog: FC<RiskMatrixCreateDialogProps> = ({
  open,
  loading = false,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [source, setSource] = useState<RiskMatrixCreateSourceEnum>(
    RiskMatrixCreateSourceEnum.BLANK,
  );
  const [error, setError] = useState<string | null>(null);

  const resetAndClose = () => {
    setName('');
    setDescription('');
    setSource(RiskMatrixCreateSourceEnum.BLANK);
    setError(null);
    onClose();
  };

  const handleSubmit = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Nome da matriz é obrigatório');
      return;
    }

    if (trimmedName.length > NAME_MAX) {
      setError(`Nome deve ter no máximo ${NAME_MAX} caracteres`);
      return;
    }

    const trimmedDescription = description.trim();
    if (trimmedDescription.length > DESCRIPTION_MAX) {
      setError(`Descrição deve ter no máximo ${DESCRIPTION_MAX} caracteres`);
      return;
    }

    try {
      setError(null);
      await onSubmit(
        buildCreateRiskMatrixPayload({
          name: trimmedName,
          description: trimmedDescription,
          source,
        }),
      );
      setName('');
      setDescription('');
      setSource(RiskMatrixCreateSourceEnum.BLANK);
    } catch (submitError) {
      setError(
        getRiskMatrixApiErrorMessage(
          submitError,
          'Não foi possível criar a matriz de risco.',
        ),
      );
    }
  };

  return (
    <Dialog open={open} onClose={loading ? undefined : resetAndClose} fullWidth maxWidth="sm">
      <DialogTitle>Criar matriz de risco</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
        {error && <Alert severity="error">{error}</Alert>}
        <FormControl>
          <FormLabel>Origem da matriz</FormLabel>
          <RadioGroup
            value={source}
            onChange={(event) =>
              setSource(event.target.value as RiskMatrixCreateSourceEnum)
            }
          >
            <FormControlLabel
              value={RiskMatrixCreateSourceEnum.BLANK}
              control={<Radio />}
              disabled={loading}
              label="Em branco"
            />
            <FormControlLabel
              value={RiskMatrixCreateSourceEnum.SYSTEM}
              control={<Radio />}
              disabled={loading}
              label="A partir do Padrão SimpleSST"
            />
          </RadioGroup>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
            {RISK_MATRIX_CREATE_SOURCE_HELP}
          </Typography>
        </FormControl>
        <TextField
          autoFocus
          required
          fullWidth
          label="Nome"
          value={name}
          onChange={(event) => setName(event.target.value)}
          inputProps={{ maxLength: NAME_MAX }}
          disabled={loading}
        />
        <TextField
          fullWidth
          multiline
          minRows={3}
          label="Descrição"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          inputProps={{ maxLength: DESCRIPTION_MAX }}
          disabled={loading}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={resetAndClose} disabled={loading}>
          Cancelar
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Criando…' : 'Criar matriz'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
