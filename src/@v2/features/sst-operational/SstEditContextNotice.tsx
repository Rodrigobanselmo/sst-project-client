import { Alert, Button, Stack, Typography } from '@mui/material';
import { civilDateDisplay } from './civil-date';

export function SstEditContextNotice({
  date,
  needsRenewal,
  onRenew,
  onToday,
  onChange,
  onClear,
  disabled = false,
}: {
  date: string;
  needsRenewal: boolean;
  onRenew(): void;
  onToday(): void;
  onChange(): void;
  onClear(): void;
  disabled?: boolean;
}) {
  return (
    <Alert severity={needsRenewal ? 'warning' : 'info'}>
      <Stack spacing={4} useFlexGap>
        <Typography variant="body2">
          Novas condições desde{' '}
          {date ? civilDateDisplay(date) : 'a data que você informar'}.
        </Typography>
        <Typography variant="body2">
          {needsRenewal
            ? 'Esta sugestão veio de outro dia. Confirme se a mesma data ainda corresponde às mudanças ou volte para hoje.'
            : 'Sugestão para esta empresa neste aparelho. Confira cada alteração; isso não autoriza gravações futuras nem transmite eventos.'}
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={4} useFlexGap>
          {needsRenewal && (
            <Button disabled={disabled} onClick={onRenew}>
              Renovar contexto com esta data
            </Button>
          )}
          <Button disabled={disabled} onClick={onToday}>
            Usar data de hoje
          </Button>
          <Button disabled={disabled} onClick={onChange}>
            Alterar data
          </Button>
          <Button disabled={disabled} onClick={onClear}>
            Encerrar sugestão salva
          </Button>
        </Stack>
      </Stack>
    </Alert>
  );
}
