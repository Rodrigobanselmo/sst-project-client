import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Typography,
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  SstDateField,
  useSstDateValidity,
} from '@v2/features/sst-operational/SstDateField';
import { CampaignCycles, updateCampaignSchedule } from './campaign-cycles.api';

export function CampaignScheduleDialog({
  companyId,
  applicationId,
  current,
  onClose,
}: {
  companyId: string;
  applicationId: string;
  current: CampaignCycles['current'];
  onClose: () => void;
}) {
  const [start, setStart] = useState(current.plannedStart || '');
  const [end, setEnd] = useState(current.plannedEnd || '');
  const [automaticStart, setAutomaticStart] = useState(current.automaticStart);
  const [automaticEnd, setAutomaticEnd] = useState(current.automaticEnd);
  const { datesValid, dateFieldValidity } = useSstDateValidity();
  const cache = useQueryClient();
  const mutation = useMutation({
    mutationFn: (remove: boolean) =>
      updateCampaignSchedule(companyId, applicationId, {
        plannedStart: (remove ? current.plannedStart : start) || undefined,
        plannedEnd: (remove ? current.plannedEnd : end) || undefined,
        automaticStart: remove ? false : automaticStart,
        automaticEnd: remove ? false : automaticEnd,
      }),
    onSuccess: async () => {
      await cache.invalidateQueries({
        queryKey: ['form-campaign-cycles', companyId],
      });
      onClose();
    },
  });
  const error = (mutation.error as any)?.response?.data?.message;
  return (
    <Dialog
      open
      fullWidth
      maxWidth="sm"
      sx={{ '& .MuiFormControlLabel-label': { color: 'text.primary' } }}
      onClose={mutation.isPending ? undefined : onClose}
    >
      <DialogTitle sx={{ color: 'text.primary' }}>
        Editar agendamento
      </DialogTitle>
      <DialogContent>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            pt: '12px',
          }}
        >
          <Typography color="text.secondary">
            Horário de Brasília. Todo o último dia está incluído. A mudança de
            status ocorre na virada do dia, com tolerância de até um minuto.
            Remover o agendamento mantém o status atual e as datas previstas.
          </Typography>
          <SstDateField
            label="Início previsto"
            value={start}
            onChange={setStart}
            onValidityChange={dateFieldValidity('start')}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={automaticStart}
                disabled={!['PENDING', 'TESTING'].includes(current.status)}
                onChange={(_, v) => setAutomaticStart(v)}
              />
            }
            label="Iniciar automaticamente às 00h00 da data inicial"
          />
          <SstDateField
            label="Término previsto"
            value={end}
            onChange={setEnd}
            onValidityChange={dateFieldValidity('end')}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={automaticEnd}
                onChange={(_, v) => setAutomaticEnd(v)}
              />
            }
            label="Encerrar automaticamente ao final da data de término (23h59min59s)"
          />
          {start && end && end < start && (
            <Alert severity="error">
              O término deve ser igual ou posterior ao início.
            </Alert>
          )}
          {mutation.isError && (
            <Alert severity="error">
              {Array.isArray(error)
                ? error.join(' ')
                : error || 'Não foi possível salvar o agendamento.'}
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: '20px', gap: '8px', flexWrap: 'wrap' }}>
        <Button
          disabled={mutation.isPending}
          onClick={() => mutation.mutate(true)}
        >
          Remover agendamento
        </Button>
        <Button disabled={mutation.isPending} onClick={onClose}>
          Cancelar
        </Button>
        <Button
          variant="outlined"
          disabled={
            mutation.isPending ||
            !datesValid ||
            !!(start && end && end < start) ||
            (automaticStart && !start) ||
            (automaticEnd && !end)
          }
          onClick={() => mutation.mutate(false)}
        >
          {mutation.isPending ? 'Salvando…' : 'Salvar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
