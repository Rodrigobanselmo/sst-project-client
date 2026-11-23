import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { SamplingDaysEstimate, SamplingDaysPanel } from './ho-sampling-days';
import { SamplingSettings } from './ho-sampling-strategy';
export function HoExecutionPlanning({
  sampling,
  estimate,
  save,
  onBack,
}: {
  onBack: () => void;
  sampling: SamplingSettings;
  estimate: () => Promise<SamplingDaysEstimate>;
  save: (days: number) => Promise<void>;
}) {
  const [value, setValue] = useState<SamplingDaysEstimate | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [message, setMessage] = useState(''),
    [days, setDays] = useState(sampling.distribution?.plannedDays ?? 1);
  useEffect(() => {
    let alive = true;
    setBusy(true);
    setValue(null);
    estimate()
      .then((v) => {
        if (alive) setValue(v);
      })
      .catch(() => {
        if (alive)
          setError(
            'Não foi possível dimensionar. Reabra a 3.4 e resolva as pendências antes de continuar.',
          );
      })
      .finally(() => {
        if (alive) setBusy(false);
      });
    return () => {
      alive = false;
    };
  }, [estimate]);
  const dirty=days!==(sampling.distribution?.plannedDays??1);
  return (
    <Stack spacing={8}>
      <Typography variant="h6">
        3.6 Dimensionamento operacional da campanha
      </Typography>
      <Alert severity="info">
        Cálculo baseado nas decisões salvas nas etapas 3.3 e 3.4. O período da
        campanha é a janela de calendário; os dias de coleta são os dias
        efetivamente reservados dentro dela.
      </Alert>
      <Paper variant="outlined" sx={{ p: 8 }}>
        <SamplingDaysPanel
          value={value}
          busy={busy}
          error={error}
          onAdopt={setDays}
        />
      </Paper>
      {sampling.distribution && (
        <Typography>
          Período da campanha:{' '}
          {sampling.distribution.startDate.split('-').reverse().join('/')} a{' '}
          {sampling.distribution.endDate.split('-').reverse().join('/')}. Para
          alterar datas ou recursos, volte à 3.3.
        </Typography>
      )}
      <TextField
        type="number"
        label="Dias de coleta reservados dentro do período"
        value={days || ''}
        onChange={(e) => setDays(Number(e.target.value))}
        inputProps={{ min: 1, max: 10000, step: 1 }}
        helperText="Não corresponde à quantidade de dias corridos entre o início e o término da campanha."
      />
      {value?.days != null && days < value.days && (
        <Alert severity="warning">
          Você reservou {days} dia(s) de coleta; são estimados {value.days} dias
          com os recursos informados. Esses dias podem ser distribuídos dentro
          do período da campanha.
        </Alert>
      )}
      {message && <Alert severity="success">{message}</Alert>}
      <Stack direction="row" spacing={4} useFlexGap flexWrap="wrap">
      <Button disabled={busy} onClick={onBack}>Voltar para 3.5</Button>
      <Button
        variant="contained"
        disabled={
          busy || !dirty ||
          !value?.days ||
          !!value?.pendingEvaluations ||
          !Number.isInteger(days) ||
          days < value.days
        }
        onClick={async () => {
          setBusy(true);
          setMessage('');
          setError('');
          try {
            await save(days);
            setMessage('Dias de coleta salvos na campanha.');
          } catch (e: any) {
            const detail = e?.response?.data?.message;
            setError(
              Array.isArray(detail)
                ? detail.join(' ')
                : detail || 'Não foi possível salvar o dimensionamento.',
            );
          } finally {
            setBusy(false);
          }
        }}
      >
        Salvar dimensionamento da etapa 3.6
      </Button>
      </Stack>
      <Typography variant="caption">{dirty?'Há alterações no dimensionamento ainda não salvas.':'Dias de coleta salvos. Nenhuma alteração pendente.'}</Typography>
    </Stack>
  );
}
