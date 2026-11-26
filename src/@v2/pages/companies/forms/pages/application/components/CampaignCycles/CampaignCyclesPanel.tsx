import { CampaignScheduleDialog } from './CampaignScheduleDialog';
import { SButton } from '@v2/components/atoms/SButton/SButton';
import { formApplicationActionButtonSx } from '../form-application-action-button.styles';
import { useState } from 'react';
import { Alert, Box, Button, Chip, Typography, useTheme } from '@mui/material';
import AddRounded from '@mui/icons-material/AddRounded';
import { useAppRouter } from '@v2/hooks/useAppRouter';
import { PageRoutes } from '@v2/constants/pages/routes';
import { CampaignCycles, useCampaignCycles } from './campaign-cycles.api';
import { CreateCycleDialog } from './CreateCycleDialog';
export function CampaignCyclesPanel({
  companyId,
  applicationId,
  data: supplied,
}: {
  companyId: string;
  applicationId: string;
  data?: CampaignCycles;
}) {
  const theme = useTheme();
  const query = useCampaignCycles(companyId, applicationId);
  const data = supplied || query.data;
  const [open, setOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const router = useAppRouter();
  if (query.isError)
    return (
      <Alert severity="warning" sx={{ my: '16px' }}>
        Não foi possível carregar os ciclos.{' '}
        <Button onClick={() => query.refetch()}>Tentar novamente</Button>
      </Alert>
    );
  if (!data)
    return <Typography sx={{ py: '16px' }}>Carregando ciclos…</Typography>;
  return (
    <Box
      sx={{
        borderTop: '1px solid',
        borderColor: 'divider',
        mt: '16px',
        pt: '20px',
        pb: '12px',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        <Box>
          <Typography color="text.primary" fontWeight={600}>
            Ciclos da pesquisa
          </Typography>
          <Typography color="text.secondary" variant="body2">
            {data.seriesName} · {data.cycles.length}{' '}
            {data.cycles.length === 1 ? 'ciclo' : 'ciclos'}
          </Typography>
        </Box>
        <Box
          sx={{ '&& .MuiButton-root': formApplicationActionButtonSx(theme) }}
        >
          <SButton
            text="Criar próximo ciclo"
            variant="outlined"
            color="info"
            icon={<AddRounded sx={{ fontSize: 18 }} />}
            disabled={!data.canCreate}
            onClick={() => setOpen(true)}
          />
        </Box>
      </Box>
      <Box sx={{ display: 'flex', gap: '8px', flexWrap: 'wrap', my: '16px' }}>
        {data.cycles.map((c) => (
          <Chip
            key={c.applicationId}
            label={`Ciclo ${c.number} · ${c.referencePeriod}`}
            color={c.applicationId === applicationId ? 'primary' : 'default'}
            variant={c.applicationId === applicationId ? 'filled' : 'outlined'}
            onClick={
              c.applicationId === applicationId
                ? undefined
                : () =>
                    router.push(PageRoutes.FORMS.FORMS_APPLICATION.VIEW, {
                      pathParams: { companyId, id: c.applicationId },
                    })
            }
          />
        ))}
      </Box>
      {!data.canCreate && (
        <Typography variant="body2" color="text.secondary">
          O próximo ciclo pode ser criado a partir do ciclo mais recente, após
          sua conclusão.
        </Typography>
      )}
      {data.current.plannedStart && (
        <Typography variant="body2" color="text.primary">
          Início previsto:{' '}
          {data.current.plannedStart.split('-').reverse().join('/')}
        </Typography>
      )}
      {data.current.plannedEnd && (
        <Typography variant="body2" color="text.primary">
          Término previsto:{' '}
          {data.current.plannedEnd.split('-').reverse().join('/')}
        </Typography>
      )}
      {data.current.canEditSchedule && (
        <Box
          sx={{
            mt: '12px',
            '&& .MuiButton-root': formApplicationActionButtonSx(theme),
          }}
        >
          <SButton
            text="Editar agendamento"
            variant="outlined"
            color="info"
            onClick={() => setScheduleOpen(true)}
          />
        </Box>
      )}
      {(data.current.automaticStart || data.current.automaticEnd) && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: '8px' }}>
          Automático:{' '}
          {[
            data.current.automaticStart && 'início',
            data.current.automaticEnd && 'encerramento',
          ]
            .filter(Boolean)
            .join(' e ')}{' '}
          · horário de Brasília
        </Typography>
      )}
      {scheduleOpen && (
        <CampaignScheduleDialog
          companyId={companyId}
          applicationId={applicationId}
          current={data.current}
          onClose={() => setScheduleOpen(false)}
        />
      )}
      {open && (
        <CreateCycleDialog
          companyId={companyId}
          applicationId={applicationId}
          data={data}
          onClose={() => setOpen(false)}
        />
      )}
    </Box>
  );
}
