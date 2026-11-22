import { Stack, Tooltip, Typography } from '@mui/material';
export type SamplingActivity = {
  id: string;
  name: string;
  product: string;
  durationMinutes: number | null;
  frequencyCount: number | null;
  frequencyPeriod: string | null;
  peakContactMoment: string | null;
  surveyStatus: string;
};
export type ExposureActivities = {
  exposureId: string;
  activities: SamplingActivity[];
};
export function SamplingActivities({
  activities,
}: {
  activities: SamplingActivity[];
}) {
  const unique = [...new Map(activities.map((a) => [a.id, a])).values()];
  return (
    <Tooltip
      describeChild
      arrow
      enterTouchDelay={0}
      componentsProps={{ tooltip: { sx: { maxWidth: 560 } } }}
      title={
        <Stack
          spacing={5}
          sx={{
            p: 3,
            color: 'common.white',
            '& .MuiTypography-root': { color: 'inherit' },
          }}
        >
          <Typography variant="body2" fontWeight={700}>
            Atividades atuais vinculadas ao produto e ao GSE
          </Typography>
          {unique.length ? (
            unique.map((a) => (
              <Stack key={a.id} spacing={2}>
                <Typography variant="body2" fontWeight={600}>
                  {a.name} · {a.product}
                </Typography>
                <Typography variant="body2">
                  Duração:{' '}
                  {a.durationMinutes == null
                    ? 'não informada'
                    : `${a.durationMinutes} min`}{' '}
                  · Frequência: {a.frequencyCount ?? 'não informada'}{' '}
                  {a.frequencyPeriod ?? ''}
                </Typography>
                {a.peakContactMoment && (
                  <Typography variant="body2">
                    Contato/pico: {a.peakContactMoment}
                  </Typography>
                )}
                <Typography variant="body2">
                  Levantamento:{' '}
                  {{
                    LEVANTAMENTO_CONCLUIDO: 'Concluído',
                    RASCUNHO: 'Rascunho',
                  }[a.surveyStatus] || a.surveyStatus}
                </Typography>
              </Stack>
            ))
          ) : (
            <Typography variant="body2">
              Nenhuma atividade encontrada com vínculo explícito entre este
              agente, o produto e este GSE. Isso não comprova ausência de
              exposição ou de pico.
            </Typography>
          )}
        </Stack>
      }
    >
      <Typography
        component="span"
        tabIndex={0}
        variant="body2"
        sx={{
          cursor: 'help',
          textDecoration: 'underline dotted',
          display: 'inline-block',
        }}
      >
        Condições de amostragem · {unique.length} atividade
        {unique.length === 1 ? '' : 's'}
      </Typography>
    </Tooltip>
  );
}
