import { FC, useEffect, useState } from 'react';

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { useMutateUpsertEsocialProcedure } from '@v2/services/medicine/esocial-procedure/hooks/useMutateEsocialProcedure';
import {
  EsocialProcedureStatusEnum,
  EsocialProcedureTypeEnum,
  IEsocialProcedureItem,
} from '@v2/services/medicine/esocial-procedure/service/esocial-procedure.types';

import {
  esocialProcedureSourceLabels,
  esocialProcedureStatusLabels,
  esocialProcedureTypeLabels,
} from '../esocial-procedure-labels';

type Props = {
  open: boolean;
  item: IEsocialProcedureItem | null;
  onClose: () => void;
};

const UNCLASSIFIED = '';

export const EsocialProcedureFormModal: FC<Props> = ({
  open,
  item,
  onClose,
}) => {
  const upsertMutation = useMutateUpsertEsocialProcedure();

  const [status, setStatus] = useState<EsocialProcedureStatusEnum>(
    EsocialProcedureStatusEnum.DRAFT,
  );
  const [isOccupationalRelevant, setIsOccupationalRelevant] = useState(false);
  const [technicalType, setTechnicalType] = useState<
    EsocialProcedureTypeEnum | typeof UNCLASSIFIED
  >(UNCLASSIFIED);
  const [internalNotes, setInternalNotes] = useState('');

  useEffect(() => {
    if (!open) return;
    const curation = item?.curation;
    setStatus(curation?.status ?? EsocialProcedureStatusEnum.DRAFT);
    setIsOccupationalRelevant(curation?.isOccupationalRelevant ?? false);
    setTechnicalType(curation?.technicalType ?? UNCLASSIFIED);
    setInternalNotes(curation?.internalNotes ?? '');
  }, [open, item]);

  const handleSubmit = () => {
    if (!item) return;
    upsertMutation.mutate(
      {
        procedureCode: item.procedureCode,
        payload: {
          status,
          isOccupationalRelevant,
          technicalType:
            technicalType === UNCLASSIFIED ? null : technicalType,
          internalNotes: internalNotes.trim() || null,
        },
      },
      { onSuccess: () => onClose() },
    );
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {item?.curation ? 'Editar curadoria' : 'Curar procedimento'}
      </DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2} mt={1}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Procedimento oficial (Tabela 27 — somente leitura)
            </Typography>
            <Typography variant="body1">
              <b>{item?.procedureCode}</b>
              {item?.officialName ? ` — ${item.officialName}` : ''}
            </Typography>
          </Box>

          <TextField
            label="Fonte"
            value={
              item?.curation?.source
                ? esocialProcedureSourceLabels[item.curation.source]
                : esocialProcedureSourceLabels.ESOCIAL_TABLE_27
            }
            size="small"
            InputProps={{ readOnly: true }}
            helperText="Curadoria sobre a Tabela 27 oficial. Não editável nesta fase."
          />

          <FormControlLabel
            control={
              <Switch
                checked={isOccupationalRelevant}
                onChange={(event) =>
                  setIsOccupationalRelevant(event.target.checked)
                }
              />
            }
            label="Relevante para uso ocupacional / PCMSO"
          />

          <TextField
            select
            label="Tipo técnico"
            value={technicalType}
            onChange={(event) =>
              setTechnicalType(
                event.target.value as
                  | EsocialProcedureTypeEnum
                  | typeof UNCLASSIFIED,
              )
            }
            size="small"
          >
            <MenuItem value={UNCLASSIFIED}>Não classificado</MenuItem>
            {Object.values(EsocialProcedureTypeEnum).map((value) => (
              <MenuItem key={value} value={value}>
                {esocialProcedureTypeLabels[value]}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Status"
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as EsocialProcedureStatusEnum)
            }
            size="small"
          >
            {Object.values(EsocialProcedureStatusEnum).map((value) => (
              <MenuItem key={value} value={value}>
                {esocialProcedureStatusLabels[value]}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Observações técnicas (internas)"
            value={internalNotes}
            onChange={(event) => setInternalNotes(event.target.value)}
            size="small"
            multiline
            minRows={3}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={upsertMutation.isPending}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={upsertMutation.isPending}
        >
          {upsertMutation.isPending ? 'Salvando...' : 'Salvar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
